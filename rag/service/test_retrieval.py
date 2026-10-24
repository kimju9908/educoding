"""Tests for retrieval.py: the framework-agnostic retrieval + tool-schema layer
shared by main.py (FastAPI) and agent_graph.py (LangGraph). Mocks Elasticsearch
and the embedding model -- see rag/eval/ for the golden-set harness that runs
retrieve() against the real stack.
"""
import numpy as np
import pytest
from elasticsearch import NotFoundError

import retrieval


class FakeModel:
    def encode(self, texts, normalize_embeddings=True):
        return np.array([[0.1, 0.2, 0.3] for _ in texts])


class FakeEs:
    """Stands in for the Elasticsearch client's .search(...)/.get(...) calls."""

    def __init__(self, hits):
        self._hits = hits
        self._docs = {h["_source"]["id"]: h["_source"] for h in hits}
        self.last_kwargs = None

    def search(self, **kwargs):
        self.last_kwargs = kwargs
        return {"hits": {"hits": self._hits}}

    def get(self, *, index, id):
        if id not in self._docs:
            raise NotFoundError("not found", None, None)
        return {"_source": self._docs[id]}


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


@pytest.fixture
def es(monkeypatch):
    fake = FakeEs(hits=[make_hit()])
    monkeypatch.setitem(retrieval.state, "es", fake)
    return fake


@pytest.fixture
def model(monkeypatch):
    fake = FakeModel()
    monkeypatch.setitem(retrieval.state, "model", fake)
    return fake


def test_verify_auth_disabled_when_no_key_configured(monkeypatch):
    monkeypatch.setattr(retrieval, "RAG_X_API_KEY", None)
    retrieval.verify_auth(None, None)  # must not raise


def test_verify_auth_rejects_wrong_credentials(monkeypatch):
    monkeypatch.setattr(retrieval, "RAG_X_API_KEY", "secret")
    monkeypatch.setattr(retrieval, "RAG_X_CLIENT_ID", "client-1")
    with pytest.raises(Exception) as exc_info:
        retrieval.verify_auth("wrong", "client-1")
    assert exc_info.value.status_code == 401


def test_verify_auth_accepts_matching_credentials(monkeypatch):
    monkeypatch.setattr(retrieval, "RAG_X_API_KEY", "secret")
    monkeypatch.setattr(retrieval, "RAG_X_CLIENT_ID", "client-1")
    retrieval.verify_auth("secret", "client-1")  # must not raise


def test_retrieve_filters_hits_below_min_score(es, model, monkeypatch):
    monkeypatch.setattr(retrieval, "RAG_MIN_SCORE", 0.75)
    es._hits = [make_hit(id="a", score=0.9), make_hit(id="b", score=0.5)]

    hits = retrieval.retrieve("질문", None)

    assert [h["_source"]["id"] for h in hits] == ["a"]


def test_retrieve_forwards_language_as_knn_filter(es, model):
    retrieval.retrieve("질문", "java")
    assert es.last_kwargs["knn"]["filter"] == {"term": {"language": "java"}}


def test_resolve_tool_language_ignores_unsupported_value():
    assert retrieval.resolve_tool_language({"language": "rust"}, "java") == "java"
    assert retrieval.resolve_tool_language({}, "java") == "java"
    assert retrieval.resolve_tool_language({"language": "python"}, "java") == "python"


def test_format_search_result_reports_no_match():
    assert "검색 결과 없음" in retrieval.format_search_result([], {})


def test_format_search_result_keeps_citation_numbers_stable_across_calls():
    cited = {}
    hit_a = make_hit(id="chunk-a", heading="A")
    hit_b = make_hit(id="chunk-b", heading="B")

    first = retrieval.format_search_result([hit_a], cited)
    assert "[1]" in first and "A" in first

    # second call repeats hit_a and introduces hit_b -- hit_a must keep number 1
    second = retrieval.format_search_result([hit_a, hit_b], cited)
    assert "[1]" in second and "A" in second
    assert "[2]" in second and "B" in second


def test_ordered_hits_from_cited_sorts_by_citation_number():
    hit_a = make_hit(id="a")
    hit_b = make_hit(id="b")
    cited = {"b": (1, hit_b), "a": (2, hit_a)}

    assert retrieval.ordered_hits_from_cited(cited) == [hit_b, hit_a]


def test_build_system_prompt_mentions_the_tool():
    assert "search_study_material" in retrieval.build_system_prompt()


def test_get_chunk_by_id_returns_the_source_with_a_synthetic_score(es, model):
    hit = retrieval.get_chunk_by_id("java-04-02-03")

    assert hit["_source"]["id"] == "java-04-02-03"
    assert hit["_score"] == 1.0


def test_get_chunk_by_id_returns_none_when_not_found(es, model):
    assert retrieval.get_chunk_by_id("does-not-exist") is None


def test_search_or_lookup_prefers_chunk_id_over_query(es, model):
    hits = retrieval.search_or_lookup("아무 질문", "java", "java-04-02-03")

    assert [h["_source"]["id"] for h in hits] == ["java-04-02-03"]
    assert es.last_kwargs is None  # .search() (semantic query) was never called


def test_search_or_lookup_falls_back_to_query_when_no_chunk_id(es, model):
    hits = retrieval.search_or_lookup("메소드 선언", "java", None)

    assert len(hits) == 1
    assert es.last_kwargs is not None  # .search() was used


def test_search_or_lookup_returns_empty_when_neither_query_nor_chunk_id():
    assert retrieval.search_or_lookup(None, "java", None) == []


def test_chat_turn_sources_default_to_empty_and_accept_cited_sources():
    bare = retrieval.ChatTurn(role="user", content="질문")
    assert bare.sources == []

    cited = retrieval.ChatTurn(
        role="assistant", content="답변 [1]",
        sources=[retrieval.CitedSource(citationNumber=1, chunkId="java-04-02-03")],
    )
    assert cited.sources[0].chunkId == "java-04-02-03"
