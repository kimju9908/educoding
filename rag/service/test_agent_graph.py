"""Tests for agent_graph.py: the LangGraph agent <-> tools loop.

ChatAnthropic is faked out (no real Claude calls); Elasticsearch/the embedding
model are faked the same way test_retrieval.py does, since the tools node
calls retrieval.retrieve() for real.
"""
import numpy as np
import pytest
from elasticsearch import NotFoundError
from langchain_core.messages import AIMessage

import agent_graph
import retrieval
from retrieval import ChatTurn, CitedSource


class FakeModel:
    def encode(self, texts, normalize_embeddings=True):
        return np.array([[0.1, 0.2, 0.3] for _ in texts])


class FakeEs:
    def __init__(self, hits):
        self._hits = hits
        self._docs = {h["_source"]["id"]: h["_source"] for h in hits}

    def search(self, **kwargs):
        return {"hits": {"hits": self._hits}}

    def get(self, *, index, id):
        if id not in self._docs:
            raise NotFoundError("not found", None, None)
        return {"_source": self._docs[id]}


def make_hit(id="java-04-02-03", score=1.0, language="java", heading="메소드의 선언"):
    return {
        "_score": score,
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


@pytest.fixture(autouse=True)
def es_and_model(monkeypatch):
    monkeypatch.setitem(retrieval.state, "es", FakeEs(hits=[make_hit()]))
    monkeypatch.setitem(retrieval.state, "model", FakeModel())


def text_message(text):
    return AIMessage(content=text)


def tool_call_message(call_id, query=None, language=None, chunk_id=None):
    args = {}
    if query is not None:
        args["query"] = query
    if language is not None:
        args["language"] = language
    if chunk_id is not None:
        args["chunk_id"] = chunk_id
    return AIMessage(
        content=[{"type": "text", "text": ""}],
        tool_calls=[{"name": "search_study_material", "args": args, "id": call_id}],
    )


class FakeBoundModel:
    """One of the three tool_choice variants bound in build_graph -- all three
    share the same underlying `calls` log and `responses` queue so the test can
    see, in order, which variant actually got invoked at each step.
    """

    def __init__(self, calls, responses, tool_choice):
        self._calls = calls
        self._responses = responses
        self.tool_choice = tool_choice

    def invoke(self, messages):
        self._calls.append({"messages": list(messages), "tool_choice": self.tool_choice})
        return self._responses.pop(0)


class FakeChatAnthropic:
    def __init__(self, responses, **init_kwargs):
        self.calls = []
        self._responses = list(responses)
        self.init_kwargs = init_kwargs

    def bind_tools(self, tools, tool_choice=None, **kwargs):
        return FakeBoundModel(self.calls, self._responses, tool_choice)


def mock_chat_anthropic(monkeypatch, responses):
    fake = FakeChatAnthropic(responses=responses)
    monkeypatch.setattr(agent_graph, "ChatAnthropic", lambda **kwargs: fake)
    return fake


def test_run_forces_search_tool_on_first_call_then_auto(monkeypatch):
    fake = mock_chat_anthropic(monkeypatch, [
        tool_call_message("tu_1", "메소드 선언 방법"),
        text_message("답변입니다 [1]."),
    ])

    answer, hits = agent_graph.run("질문", None, [], "fake-key", "claude-sonnet-5", 4)

    assert answer == "답변입니다 [1]."
    assert len(hits) == 1
    assert fake.calls[0]["tool_choice"] == {"type": "tool", "name": "search_study_material"}
    assert fake.calls[1]["tool_choice"] is None  # "auto" -- bind_tools called without tool_choice


def test_run_includes_history_before_the_question(monkeypatch):
    fake = mock_chat_anthropic(monkeypatch, [text_message("답")])
    history = [
        ChatTurn(role="user", content="자바에서 메소드는 어떻게 선언하나요?"),
        ChatTurn(role="assistant", content="메소드는 [1]처럼 선언합니다."),
    ]

    agent_graph.run("그럼 반환값이 없을 때는요?", "java", history, "fake-key", "claude-sonnet-5", 4)

    sent_messages = fake.calls[0]["messages"]
    # [0] is the system message; history then follows in order, question last
    assert sent_messages[1].content == "자바에서 메소드는 어떻게 선언하나요?"
    assert sent_messages[2].content == "메소드는 [1]처럼 선언합니다."
    assert sent_messages[3].content == "그럼 반환값이 없을 때는요?"


def test_run_drops_history_beyond_max_history_turns(monkeypatch):
    fake = mock_chat_anthropic(monkeypatch, [text_message("답")])
    history = [
        ChatTurn(role="user" if i % 2 == 0 else "assistant", content=f"turn {i}")
        for i in range(10)
    ]

    agent_graph.run("질문", None, history, "fake-key", "claude-sonnet-5", 4)

    sent_messages = fake.calls[0]["messages"]
    # system message + MAX_HISTORY_TURNS history turns + the current question
    assert len(sent_messages) == 1 + retrieval.MAX_HISTORY_TURNS + 1


def test_run_executes_tool_call_and_loops_back_to_agent(monkeypatch):
    fake = mock_chat_anthropic(monkeypatch, [
        tool_call_message("tu_1", "메소드 선언 방법", language="java"),
        text_message("메소드는 [1]처럼 선언합니다."),
    ])

    answer, hits = agent_graph.run("질문", None, [], "fake-key", "claude-sonnet-5", 4)

    assert answer == "메소드는 [1]처럼 선언합니다."
    assert hits[0]["_source"]["id"] == "java-04-02-03"
    assert len(fake.calls) == 2  # agent -> tools -> agent


def test_run_forces_final_answer_after_max_iterations(monkeypatch):
    max_iterations = 3
    responses = [tool_call_message(f"tu_{i}", f"검색 {i}") for i in range(max_iterations + 2)]
    fake = mock_chat_anthropic(monkeypatch, responses)
    # Simulate what tool_choice="none" forces in the real API: the last allowed
    # agent call returns text, not another tool call.
    fake._responses[max_iterations - 1] = text_message("더 이상 검색하지 않고 답변합니다.")

    answer, hits = agent_graph.run("질문", None, [], "fake-key", "claude-sonnet-5", max_iterations)

    assert answer == "더 이상 검색하지 않고 답변합니다."
    assert len(fake.calls) == max_iterations
    assert fake.calls[-1]["tool_choice"] == {"type": "none"}


def test_build_graph_disables_thinking_only_for_the_forced_tool_model(monkeypatch):
    # langchain-anthropic silently drops a forced tool_choice whenever `thinking`
    # is enabled on the model (it just falls back to auto) -- that reintroduced
    # the bug phase 3 fixed, where Claude could skip the mandatory first search.
    # The fix is a second ChatAnthropic instance with no `thinking` kwarg, used
    # only for the forced call. This checks build_graph actually constructs both.
    constructed = []

    class DummyChatAnthropic:
        def __init__(self, **kwargs):
            constructed.append(kwargs)

        def bind_tools(self, tools, tool_choice=None, **kwargs):
            return self

    monkeypatch.setattr(agent_graph, "ChatAnthropic", DummyChatAnthropic)

    agent_graph.build_graph("fake-key", "claude-sonnet-5", 4, None)

    assert len(constructed) == 2
    with_thinking = [kwargs for kwargs in constructed if "thinking" in kwargs]
    without_thinking = [kwargs for kwargs in constructed if "thinking" not in kwargs]
    assert len(with_thinking) == 1
    assert with_thinking[0]["thinking"] == {"type": "adaptive"}
    assert len(without_thinking) == 1


def test_run_appends_citation_mapping_for_assistant_turns_with_sources(monkeypatch):
    fake = mock_chat_anthropic(monkeypatch, [text_message("답")])
    history = [
        ChatTurn(role="user", content="메소드는 어떻게 선언하나요?"),
        ChatTurn(
            role="assistant", content="메소드는 [1]처럼 선언합니다.",
            sources=[CitedSource(citationNumber=1, chunkId="java-04-02-03")],
        ),
    ]

    agent_graph.run("그 자료 더 설명해줘", None, history, "fake-key", "claude-sonnet-5", 4)

    sent_messages = fake.calls[0]["messages"]
    assistant_message = sent_messages[2]
    assert "메소드는 [1]처럼 선언합니다." in assistant_message.content
    assert "[이전 답변 자료 매핑: 1=java-04-02-03]" in assistant_message.content


def test_run_does_not_append_mapping_for_assistant_turns_without_sources(monkeypatch):
    fake = mock_chat_anthropic(monkeypatch, [text_message("답")])
    history = [ChatTurn(role="assistant", content="답변 내용")]

    agent_graph.run("질문", None, history, "fake-key", "claude-sonnet-5", 4)

    assert fake.calls[0]["messages"][1].content == "답변 내용"


def test_run_looks_up_chunk_by_id_when_tool_call_provides_one(monkeypatch):
    fake = mock_chat_anthropic(monkeypatch, [
        tool_call_message("tu_1", chunk_id="java-04-02-03"),
        text_message("그 자료는 [1]에 나온 대로입니다."),
    ])

    answer, hits = agent_graph.run("그 자료 더 설명해줘", None, [], "fake-key", "claude-sonnet-5", 4)

    assert answer == "그 자료는 [1]에 나온 대로입니다."
    assert hits[0]["_source"]["id"] == "java-04-02-03"
    # the tool_result passed back is a direct lookup, not a semantic search
    tool_result_message = fake.calls[1]["messages"][-1]
    assert "[1]" in tool_result_message.content


def test_run_tool_lookup_returns_no_match_for_unknown_chunk_id(monkeypatch):
    fake = mock_chat_anthropic(monkeypatch, [
        tool_call_message("tu_1", chunk_id="does-not-exist"),
        text_message("그 자료를 찾지 못했습니다."),
    ])

    answer, hits = agent_graph.run("그 자료 더 설명해줘", None, [], "fake-key", "claude-sonnet-5", 4)

    assert answer == "그 자료를 찾지 못했습니다."
    assert hits == []
    tool_result_message = fake.calls[1]["messages"][-1]
    assert "검색 결과 없음" in tool_result_message.content
