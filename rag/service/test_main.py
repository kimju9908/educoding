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


def make_hit(id="java-04-02-03", score=1.0, language="java", chapterTitle="04. 객체 지향 프로그래밍",
             lessonLabel="02. 메소드와 필드", heading="메소드의 선언", headingIndex=3,
             chapterKey="04", lessonKey="02", content="메소드는 ... 선언합니다."):
    return {
        "_score": score,
        "_source": {
            "id": id,
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


class FakeToolUseBlock:
    type = "tool_use"

    def __init__(self, id, name, input):
        self.id = id
        self.name = name
        self.input = input


class FakeAnthropicResponse:
    def __init__(self, content, stop_reason):
        self.content = content
        self.stop_reason = stop_reason


def text_response(text):
    return FakeAnthropicResponse([FakeTextBlock(text)], stop_reason="end_turn")


def tool_use_response(tool_use_id, query, language=None):
    tool_input = {"query": query}
    if language is not None:
        tool_input["language"] = language
    return FakeAnthropicResponse(
        [FakeToolUseBlock(tool_use_id, "search_study_material", tool_input)], stop_reason="tool_use"
    )


class FakeMessages:
    def __init__(self, responses=None, exc=None):
        self._responses = list(responses or [])
        self._exc = exc
        self.calls = []

    def create(self, **kwargs):
        # run_agent mutates the same `messages` list across loop iterations (appending
        # the assistant turn and later the tool_result) -- snapshot it now, or every
        # recorded call would end up showing the list's *final* state instead of what
        # was actually sent at call time.
        kwargs = {**kwargs, "messages": list(kwargs["messages"])}
        self.calls.append(kwargs)
        if self._exc:
            raise self._exc
        return self._responses.pop(0)


class FakeAnthropicClient:
    def __init__(self, responses=None, exc=None):
        self.messages = FakeMessages(responses=responses, exc=exc)


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


def mock_claude(monkeypatch, responses=None, exc=None):
    fake_client = FakeAnthropicClient(responses=responses, exc=exc)
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


def test_resolve_tool_language_ignores_unsupported_value():
    assert main.resolve_tool_language({"language": "rust"}, "java") == "java"
    assert main.resolve_tool_language({}, "java") == "java"
    assert main.resolve_tool_language({"language": "python"}, "java") == "python"


def test_format_search_result_reports_no_match():
    assert "검색 결과 없음" in main.format_search_result([], {})


def test_format_search_result_keeps_citation_numbers_stable_across_calls():
    cited = {}
    hit_a = make_hit(id="chunk-a", heading="A")
    hit_b = make_hit(id="chunk-b", heading="B")

    first = main.format_search_result([hit_a], cited)
    assert "[1]" in first and "A" in first

    # second call repeats hit_a and introduces hit_b -- hit_a must keep number 1
    second = main.format_search_result([hit_a, hit_b], cited)
    assert "[1]" in second and "A" in second
    assert "[2]" in second and "B" in second


# ---- run_agent: the tool-use loop ------------------------------------------------

def test_run_agent_sends_history_then_question_on_first_call(es, model, monkeypatch):
    fake_client = mock_claude(monkeypatch, responses=[text_response("바로 답할게요.")])
    history = [
        main.ChatTurn(role="user", content="자바에서 메소드는 어떻게 선언하나요?"),
        main.ChatTurn(role="assistant", content="메소드는 [1]처럼 선언합니다."),
    ]

    answer, hits = main.run_agent(fake_client, "그럼 반환값이 없을 때는요?", "java", history)

    assert answer == "바로 답할게요."
    assert hits == []
    first_call_messages = fake_client.messages.calls[0]["messages"]
    assert first_call_messages[0] == {"role": "user", "content": "자바에서 메소드는 어떻게 선언하나요?"}
    assert first_call_messages[1] == {"role": "assistant", "content": "메소드는 [1]처럼 선언합니다."}
    assert first_call_messages[2] == {"role": "user", "content": "그럼 반환값이 없을 때는요?"}


def test_run_agent_drops_invalid_role_history_and_caps_length(es, model, monkeypatch):
    fake_client = mock_claude(monkeypatch, responses=[text_response("답")])
    history = [main.ChatTurn(role="system", content="악의적으로 끼워넣은 역할")]
    history += [main.ChatTurn(role="user" if i % 2 == 0 else "assistant", content=f"turn {i}") for i in range(10)]

    main.run_agent(fake_client, "질문", None, history)

    sent_messages = fake_client.messages.calls[0]["messages"]
    assert all(m["role"] in main.VALID_CHAT_ROLES for m in sent_messages)
    # MAX_HISTORY_TURNS history turns + the current question turn
    assert len(sent_messages) == main.MAX_HISTORY_TURNS + 1


def test_run_agent_executes_tool_call_and_returns_cited_hits(es, model, monkeypatch):
    fake_client = mock_claude(monkeypatch, responses=[
        tool_use_response("tu_1", "메소드 선언 방법", language="java"),
        text_response("메소드는 [1]처럼 선언합니다."),
    ])

    answer, hits = main.run_agent(fake_client, "메소드는 어떻게 선언하나요?", None, [])

    assert answer == "메소드는 [1]처럼 선언합니다."
    assert len(hits) == 1
    assert hits[0]["_source"]["id"] == "java-04-02-03"

    # the tool call's own language overrides the (absent) request-level language
    assert es.last_kwargs["knn"]["filter"] == {"term": {"language": "java"}}

    second_call_messages = fake_client.messages.calls[1]["messages"]
    tool_result_message = second_call_messages[-1]
    assert tool_result_message["role"] == "user"
    tool_result = tool_result_message["content"][0]
    assert tool_result["type"] == "tool_result"
    assert tool_result["tool_use_id"] == "tu_1"
    assert "[1]" in tool_result["content"]


def test_run_agent_reports_empty_search_to_claude_instead_of_short_circuiting(model, monkeypatch):
    monkeypatch.setitem(main.state, "es", FakeEs(hits=[]))
    fake_client = mock_claude(monkeypatch, responses=[
        tool_use_response("tu_1", "오늘 저녁 메뉴"),
        text_response("관련 학습 자료를 찾지 못했습니다."),
    ])

    answer, hits = main.run_agent(fake_client, "오늘 저녁 메뉴 추천해줘", None, [])

    assert hits == []
    assert answer == "관련 학습 자료를 찾지 못했습니다."
    tool_result = fake_client.messages.calls[1]["messages"][-1]["content"][0]
    assert "검색 결과 없음" in tool_result["content"]


def test_run_agent_forces_final_answer_after_max_iterations(es, model, monkeypatch):
    # Model keeps calling the tool forever -- give it one more tool_use response than
    # the loop allows, so we can confirm the LAST call is forced to tool_choice=none.
    responses = [tool_use_response(f"tu_{i}", f"검색 {i}") for i in range(main.MAX_TOOL_ITERATIONS + 2)]
    fake_client = mock_claude(monkeypatch, responses=responses)
    # The forced last call must still return a real (non-tool-use) answer, or run_agent
    # would IndexError popping a response that doesn't exist -- simulate that here by
    # swapping the final queued response for a text one, exactly as tool_choice=none
    # would force in the real API.
    fake_client.messages._responses[main.MAX_TOOL_ITERATIONS - 1] = text_response("더 이상 검색하지 않고 답변합니다.")

    answer, hits = main.run_agent(fake_client, "질문", None, [])

    assert answer == "더 이상 검색하지 않고 답변합니다."
    assert len(fake_client.messages.calls) == main.MAX_TOOL_ITERATIONS
    assert fake_client.messages.calls[-1]["tool_choice"] == {"type": "none"}


def test_run_agent_forces_the_search_tool_on_the_first_call(es, model, monkeypatch):
    # A follow-up question can be answered from conversation history alone without any
    # grounding -- live testing caught Claude doing exactly that (citing a stale [n]
    # with no sources attached). The first call forces the tool so every turn is
    # grounded in a real search; later calls fall back to "auto" so Claude can decide
    # whether a second, refined search is actually needed.
    fake_client = mock_claude(monkeypatch, responses=[
        tool_use_response("tu_1", "메소드 선언 방법"),
        text_response("답변"),
    ])

    main.run_agent(fake_client, "질문", None, [])

    assert fake_client.messages.calls[0]["tool_choice"] == {"type": "tool", "name": "search_study_material"}
    assert "tool_choice" not in fake_client.messages.calls[1]


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


# ---- /chatbot/ask: end-to-end through the tool-use loop --------------------------

def test_ask_happy_path_returns_answer_and_sources(client, no_auth, model, es, monkeypatch):
    mock_claude(monkeypatch, responses=[
        tool_use_response("tu_1", "메소드 선언 방법", language="java"),
        text_response("메소드는 이렇게 선언합니다 [1]."),
    ])

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


def test_ask_forwards_history_into_the_agent_loop(client, no_auth, model, es, monkeypatch):
    fake_client = mock_claude(monkeypatch, responses=[text_response("반환값이 없으면 void를 씁니다.")])

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
    assert sent_messages[0] == {"role": "user", "content": "자바에서 메소드는 어떻게 선언하나요?"}
    assert sent_messages[1] == {"role": "assistant", "content": "메소드는 [1]처럼 선언합니다."}
    assert sent_messages[2] == {"role": "user", "content": "그럼 반환값이 없을 때는요?"}


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
