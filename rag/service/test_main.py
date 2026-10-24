"""Tests for the FastAPI transport layer in main.py: request validation,
service-to-service auth, and mapping Claude/agent errors to HTTP statuses.
Mocks agent_graph.run() itself -- see test_agent_graph.py for the LangGraph
loop's own behavior, and test_retrieval.py for the retrieval/tool-schema
layer both main.py and agent_graph.py share.

Run:
    cd rag/service
    source ../.venv/bin/activate
    pytest -v
"""
import httpx2
import pytest
from fastapi.testclient import TestClient

import agent_graph
import main
import retrieval


@pytest.fixture
def no_auth(monkeypatch):
    monkeypatch.setattr(retrieval, "RAG_X_API_KEY", None)
    monkeypatch.setattr(retrieval, "RAG_X_CLIENT_ID", None)


@pytest.fixture
def client():
    return TestClient(main.app)


def mock_agent_run(monkeypatch, result=None, exc=None):
    calls = []

    def fake_run(question, language, history, api_key, model_name, max_tool_iterations):
        calls.append({
            "question": question, "language": language, "history": history,
            "api_key": api_key, "model_name": model_name, "max_tool_iterations": max_tool_iterations,
        })
        if exc:
            raise exc
        return result

    monkeypatch.setattr(agent_graph, "run", fake_run)
    return calls


def make_hit(id="java-04-02-03", language="java", heading="메소드의 선언"):
    return {
        "_score": 0.88,
        "_source": {
            "id": id,
            "language": language,
            "chapterKey": "04",
            "chapterTitle": "04. 객체 지향 프로그래밍",
            "lessonKey": "02",
            "lessonLabel": "02. 메소드와 필드",
            "heading": heading,
            "headingIndex": 3,
            "content": "메소드는 ... 선언합니다.",
        },
    }


# ---- input validation -------------------------------------------------------------

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


# ---- service-to-service auth -------------------------------------------------------

def test_ask_rejects_missing_shared_secret(client, monkeypatch):
    monkeypatch.setattr(retrieval, "RAG_X_API_KEY", "secret")
    monkeypatch.setattr(retrieval, "RAG_X_CLIENT_ID", "client-1")
    resp = client.post(
        "/chatbot/ask",
        json={"question": "for문이 뭐야?"},
        headers={"X-Anthropic-Api-Key": "sk-test"},
    )
    assert resp.status_code == 401


# ---- happy path: wiring into agent_graph.run and back ------------------------------

def test_ask_happy_path_returns_answer_and_sources(client, no_auth, monkeypatch):
    mock_agent_run(monkeypatch, result=("메소드는 이렇게 선언합니다 [1].", [make_hit()]))

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
    assert source["chunkId"] == "java-04-02-03"


def test_ask_forwards_question_language_and_history_to_agent_graph(client, no_auth, monkeypatch):
    calls = mock_agent_run(monkeypatch, result=("답", []))

    resp = client.post(
        "/chatbot/ask",
        json={
            "question": "그럼 반환값이 없을 때는요?",
            "language": "java",
            "history": [
                {"role": "user", "content": "자바에서 메소드는 어떻게 선언하나요?"},
                {
                    "role": "assistant", "content": "메소드는 [1]처럼 선언합니다.",
                    "sources": [{"citationNumber": 1, "chunkId": "java-04-02-03"}],
                },
            ],
        },
        headers={"X-Anthropic-Api-Key": "sk-test"},
    )

    assert resp.status_code == 200
    assert len(calls) == 1
    call = calls[0]
    assert call["question"] == "그럼 반환값이 없을 때는요?"
    assert call["language"] == "java"
    assert [t.content for t in call["history"]] == ["자바에서 메소드는 어떻게 선언하나요?", "메소드는 [1]처럼 선언합니다."]
    assert call["history"][0].sources == []
    assert call["history"][1].sources[0].chunkId == "java-04-02-03"
    assert call["api_key"] == "sk-test"


def test_ask_forwards_claude_authentication_error_as_502(client, no_auth, monkeypatch):
    req = httpx2.Request("POST", "https://api.anthropic.com/v1/messages")
    resp_obj = httpx2.Response(401, request=req)
    mock_agent_run(monkeypatch, exc=main.anthropic.AuthenticationError("bad key", response=resp_obj, body=None))

    resp = client.post(
        "/chatbot/ask",
        json={"question": "메소드는 어떻게 선언하나요?"},
        headers={"X-Anthropic-Api-Key": "sk-bad"},
    )
    assert resp.status_code == 502
    assert "ANTHROPIC_API_KEY" in resp.json()["detail"]


def test_ask_forwards_claude_rate_limit_error_as_502(client, no_auth, monkeypatch):
    req = httpx2.Request("POST", "https://api.anthropic.com/v1/messages")
    resp_obj = httpx2.Response(429, request=req)
    mock_agent_run(monkeypatch, exc=main.anthropic.RateLimitError("rate limited", response=resp_obj, body=None))

    resp = client.post(
        "/chatbot/ask",
        json={"question": "메소드는 어떻게 선언하나요?"},
        headers={"X-Anthropic-Api-Key": "sk-test"},
    )
    assert resp.status_code == 502
    assert "rate limited" in resp.json()["detail"].lower() or "try again" in resp.json()["detail"].lower()


def test_ask_forwards_claude_connection_error_as_502(client, no_auth, monkeypatch):
    req = httpx2.Request("POST", "https://api.anthropic.com/v1/messages")
    mock_agent_run(monkeypatch, exc=main.anthropic.APIConnectionError(request=req))

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
