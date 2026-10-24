"""Tests for the RAG chatbot service (main.py).

Mocks the embedding model, Elasticsearch, and the Anthropic client so these
run in milliseconds with no external services -- see rag/eval/ for the
golden-set harness that exercises the real stack end to end.

Run:
    cd rag/service
    source ../.venv/bin/activate
    pytest -v
"""
import httpx2
import numpy as np
import pytest
from fastapi.testclient import TestClient

import main


class FakeModel:
    def encode(self, texts, normalize_embeddings=True):
        return np.array([[0.1, 0.2, 0.3] for _ in texts])


class FakeEs:
    """Stands in for the Elasticsearch client's .search(...) call."""

    def __init__(self, hits):
        self._hits = hits
        self.last_kwargs = None

    def search(self, **kwargs):
        self.last_kwargs = kwargs
        return {"hits": {"hits": self._hits}}


def make_hit(score=1.0, language="java", chapterTitle="04. 객체 지향 프로그래밍",
             lessonLabel="02. 메소드와 필드", heading="메소드의 선언", headingIndex=3,
             chapterKey="04", lessonKey="02", content="메소드는 ... 선언합니다."):
    return {
        "_score": score,
        "_source": {
            "language": language,
            "chapterKey": chapterKey,
            "chapterTitle": chapterTitle,
            "lessonKey": lessonKey,
            "lessonLabel": lessonLabel,
            "heading": heading,
            "headingIndex": headingIndex,
            "content": content,
        },
    }


class FakeTextBlock:
    type = "text"

    def __init__(self, text):
        self.text = text


class FakeAnthropicResponse:
    def __init__(self, text):
        self.content = [FakeTextBlock(text)]


class FakeMessages:
    def __init__(self, result=None, exc=None):
        self._result = result
        self._exc = exc
        self.calls = []

    def create(self, **kwargs):
        self.calls.append(kwargs)
        if self._exc:
            raise self._exc
        return self._result


class FakeAnthropicClient:
    def __init__(self, result=None, exc=None):
        self.messages = FakeMessages(result=result, exc=exc)


@pytest.fixture
def es(monkeypatch):
    fake = FakeEs(hits=[make_hit()])
    monkeypatch.setitem(main.state, "es", fake)
    return fake


@pytest.fixture
def model(monkeypatch):
    fake = FakeModel()
    monkeypatch.setitem(main.state, "model", fake)
    return fake


@pytest.fixture
def no_auth(monkeypatch):
    monkeypatch.setattr(main, "RAG_X_API_KEY", None)
    monkeypatch.setattr(main, "RAG_X_CLIENT_ID", None)


@pytest.fixture
def client():
    return TestClient(main.app)


def mock_claude(monkeypatch, result=None, exc=None):
    fake_client = FakeAnthropicClient(result=result, exc=exc)
    monkeypatch.setattr(main.anthropic, "Anthropic", lambda api_key: fake_client)
    return fake_client


# ---- unit tests for pure helpers -------------------------------------------------

def test_verify_auth_disabled_when_no_key_configured(monkeypatch):
    monkeypatch.setattr(main, "RAG_X_API_KEY", None)
    main.verify_auth(None, None)  # must not raise


def test_verify_auth_rejects_wrong_credentials(monkeypatch):
    monkeypatch.setattr(main, "RAG_X_API_KEY", "secret")
    monkeypatch.setattr(main, "RAG_X_CLIENT_ID", "client-1")
    with pytest.raises(main.HTTPException) as exc_info:
        main.verify_auth("wrong", "client-1")
    assert exc_info.value.status_code == 401


def test_verify_auth_accepts_matching_credentials(monkeypatch):
    monkeypatch.setattr(main, "RAG_X_API_KEY", "secret")
    monkeypatch.setattr(main, "RAG_X_CLIENT_ID", "client-1")
    main.verify_auth("secret", "client-1")  # must not raise


def test_build_context_message_includes_numbered_citations_and_question():
    hits = [make_hit(language="python", heading="for 문"), make_hit(language="java", heading="메소드의 선언")]
    user = main.build_context_message("for문은 어떻게 쓰나요?", hits)
    assert "[1]" in user and "[2]" in user
    assert "for 문" in user and "메소드의 선언" in user
    assert "for문은 어떻게 쓰나요?" in user
    assert "학습 자료" in main.build_system_prompt()


def test_build_messages_appends_history_before_current_turn():
    history = [
        main.ChatTurn(role="user", content="자바에서 메소드는 어떻게 선언하나요?"),
        main.ChatTurn(role="assistant", content="메소드는 [1]처럼 선언합니다."),
    ]
    messages = main.build_messages("그럼 반환값이 없을 때는요?", [make_hit()], history)

    assert len(messages) == 3
    assert messages[0] == {"role": "user", "content": "자바에서 메소드는 어떻게 선언하나요?"}
    assert messages[1] == {"role": "assistant", "content": "메소드는 [1]처럼 선언합니다."}
    assert messages[2]["role"] == "user"
    assert "그럼 반환값이 없을 때는요?" in messages[2]["content"]


def test_build_messages_drops_turns_with_invalid_role_and_caps_length():
    history = [main.ChatTurn(role="system", content="악의적으로 끼워넣은 역할")]
    history += [main.ChatTurn(role="user" if i % 2 == 0 else "assistant", content=f"turn {i}") for i in range(10)]

    messages = main.build_messages("질문", [make_hit()], history)

    assert all(m["role"] in main.VALID_CHAT_ROLES or m is messages[-1] for m in messages)
    # MAX_HISTORY_TURNS (6) history turns + the current question turn
    assert len(messages) == main.MAX_HISTORY_TURNS + 1


# ---- /chatbot/ask: input validation ----------------------------------------------

def test_ask_rejects_empty_question(client, no_auth):
    resp = client.post("/chatbot/ask", json={"question": "   "})
    assert resp.status_code == 400


def test_ask_rejects_unsupported_language(client, no_auth):
    resp = client.post("/chatbot/ask", json={"question": "hi", "language": "rust"})
    assert resp.status_code == 400
    assert "rust" in resp.json()["detail"]


def test_ask_requires_anthropic_key_header(client, no_auth):
    resp = client.post("/chatbot/ask", json={"question": "for문이 뭐야?"})
    assert resp.status_code == 503


# ---- /chatbot/ask: service-to-service auth ---------------------------------------

def test_ask_rejects_missing_shared_secret(client, monkeypatch):
    monkeypatch.setattr(main, "RAG_X_API_KEY", "secret")
    monkeypatch.setattr(main, "RAG_X_CLIENT_ID", "client-1")
    resp = client.post(
        "/chatbot/ask",
        json={"question": "for문이 뭐야?"},
        headers={"X-Anthropic-Api-Key": "sk-test"},
    )
    assert resp.status_code == 401


# ---- /chatbot/ask: retrieval + answer generation ---------------------------------

def test_ask_returns_fallback_when_nothing_retrieved(client, no_auth, model, monkeypatch):
    monkeypatch.setitem(main.state, "es", FakeEs(hits=[]))
    resp = client.post(
        "/chatbot/ask",
        json={"question": "완전히 무관한 질문"},
        headers={"X-Anthropic-Api-Key": "sk-test"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["sources"] == []
    assert "찾지 못했습니다" in body["answer"]


def test_ask_happy_path_returns_answer_and_sources(client, no_auth, model, es, monkeypatch):
    mock_claude(monkeypatch, result=FakeAnthropicResponse("메소드는 이렇게 선언합니다 [1]."))

    resp = client.post(
        "/chatbot/ask",
        json={"question": "메소드는 어떻게 선언하나요?", "language": "java"},
        headers={"X-Anthropic-Api-Key": "sk-test"},
    )

    assert resp.status_code == 200
    body = resp.json()
    assert body["answer"] == "메소드는 이렇게 선언합니다 [1]."
    assert len(body["sources"]) == 1
    source = body["sources"][0]
    assert source["language"] == "java"
    assert source["url"] == "/study/java/04/02?headingIndex=3"

    # question gets embedded, and the language filter is forwarded as a kNN term filter
    assert es.last_kwargs["knn"]["filter"] == {"term": {"language": "java"}}


def test_ask_forwards_history_to_claude_messages(client, no_auth, model, es, monkeypatch):
    fake_client = mock_claude(monkeypatch, result=FakeAnthropicResponse("반환값이 없으면 void를 씁니다."))

    resp = client.post(
        "/chatbot/ask",
        json={
            "question": "그럼 반환값이 없을 때는요?",
            "history": [
                {"role": "user", "content": "자바에서 메소드는 어떻게 선언하나요?"},
                {"role": "assistant", "content": "메소드는 [1]처럼 선언합니다."},
            ],
        },
        headers={"X-Anthropic-Api-Key": "sk-test"},
    )

    assert resp.status_code == 200
    sent_messages = fake_client.messages.calls[0]["messages"]
    assert len(sent_messages) == 3
    assert sent_messages[0] == {"role": "user", "content": "자바에서 메소드는 어떻게 선언하나요?"}
    assert sent_messages[1] == {"role": "assistant", "content": "메소드는 [1]처럼 선언합니다."}
    assert "그럼 반환값이 없을 때는요?" in sent_messages[2]["content"]


def test_ask_forwards_claude_authentication_error_as_502(client, no_auth, model, es, monkeypatch):
    req = httpx2.Request("POST", "https://api.anthropic.com/v1/messages")
    resp_obj = httpx2.Response(401, request=req)
    mock_claude(monkeypatch, exc=main.anthropic.AuthenticationError("bad key", response=resp_obj, body=None))

    resp = client.post(
        "/chatbot/ask",
        json={"question": "메소드는 어떻게 선언하나요?"},
        headers={"X-Anthropic-Api-Key": "sk-bad"},
    )
    assert resp.status_code == 502
    assert "ANTHROPIC_API_KEY" in resp.json()["detail"]


def test_ask_forwards_claude_rate_limit_error_as_502(client, no_auth, model, es, monkeypatch):
    req = httpx2.Request("POST", "https://api.anthropic.com/v1/messages")
    resp_obj = httpx2.Response(429, request=req)
    mock_claude(monkeypatch, exc=main.anthropic.RateLimitError("rate limited", response=resp_obj, body=None))

    resp = client.post(
        "/chatbot/ask",
        json={"question": "메소드는 어떻게 선언하나요?"},
        headers={"X-Anthropic-Api-Key": "sk-test"},
    )
    assert resp.status_code == 502
    assert "rate limited" in resp.json()["detail"].lower() or "try again" in resp.json()["detail"].lower()


def test_ask_forwards_claude_connection_error_as_502(client, no_auth, model, es, monkeypatch):
    req = httpx2.Request("POST", "https://api.anthropic.com/v1/messages")
    mock_claude(monkeypatch, exc=main.anthropic.APIConnectionError(request=req))

    resp = client.post(
        "/chatbot/ask",
        json={"question": "메소드는 어떻게 선언하나요?"},
        headers={"X-Anthropic-Api-Key": "sk-test"},
    )
    assert resp.status_code == 502


def test_health():
    client = TestClient(main.app)
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}
