"""Mocked orchestration/allowlist tests; not a live model recommendation-quality evaluation."""
import pytest
from langchain_core.messages import AIMessage
from fastapi.testclient import TestClient
import learning_graph as learning
import review_graph
import retrieval
import main


def context():
    return learning.LearningContext(profile={"language": "java", "level": "PRACTICE", "goal": "BASICS"},
        summary=[{"concept": "배열", "attempted": 3, "unresolved": 2}],
        candidates=[dict(id=f"x{i}", kind="LESSON" if i < 2 else "PRACTICE" if i == 2 else "RETRY",
                         contentId=str(i), title="실제 콘텐츠", url=f"/real/{i}", concept="배열", reason="서버 근거", stage=i)
                    for i in range(4)])


@pytest.mark.parametrize("ids", [["x0", "x1", "x2", "forged"], ["x0", "x1", "x2", "x2"],
                              ["x3", "x2", "x1", "x0"], ["x0", "x1", "x2"]])
def test_rejects_fabricated_duplicate_reordered_or_missing_phase(ids):
    with pytest.raises(ValueError):
        learning.validate_selection({"candidateIds": ids}, context().candidates)


def test_rejects_model_urls_or_extra_fields():
    with pytest.raises(ValueError):
        learning.validate_selection({"candidateIds": ["x0", "x1", "x2", "x3"], "url": "https://evil"}, context().candidates)


def test_request_scoped_tools_cannot_accept_other_user():
    run = learning.LearningRun(context())
    assert "오류" in run.execute("get_learning_summary", {"userId": 99})
    assert not run.seen_summary
    assert "오류" in run.execute("find_learning_candidates", {"language": "python"})
    assert "오류" in run.execute("get_submission", {})
    assert "오류" in run.execute("submit_learning_path", {"candidateIds": ["x0", "x1", "x2", "x3"]})


def test_bounded_graph_reads_tools_and_submits_only_ids(monkeypatch):
    def call(name, args, idx):
        return AIMessage(content="", tool_calls=[{"name": name, "args": args, "id": str(idx)}])
    queue = [call("get_learning_summary", {}, 1), call("find_learning_candidates", {}, 2),
             call("submit_learning_path", {"candidateIds": ["x0", "x1", "x2", "x3"]}, 3)]
    class Model:
        def __init__(self, **kwargs): pass
        def bind_tools(self, *args, **kwargs): return self
        def invoke(self, messages): return queue.pop(0)
    monkeypatch.setattr(review_graph, "ChatAnthropic", Model)
    result = learning.run_learning_path(context(), "fake-key", "fake-model")
    assert result.candidateIds == ["x0", "x1", "x2", "x3"]
    assert not queue


def test_small_candidate_set_can_return_short_path():
    candidates = context().candidates[:1]
    assert learning.validate_selection({"candidateIds": ["x0"]}, candidates).candidateIds == ["x0"]


def test_api_requires_service_auth_and_forwards_closed_context(monkeypatch):
    monkeypatch.setattr(retrieval, "RAG_X_API_KEY", "test-only")
    monkeypatch.setattr(retrieval, "RAG_X_CLIENT_ID", "backend")
    calls = []
    def generate(ctx, *args):
        calls.append(ctx)
        return learning.Selection(candidateIds=["x0", "x1", "x2", "x3"])
    monkeypatch.setattr(learning, "run_learning_path", generate)
    client = TestClient(main.app)
    assert client.post("/learning-path/generate", json=context().model_dump()).status_code == 401
    headers = {"X-Api-Key": "test-only", "X-Client-Id": "backend", "X-Anthropic-Api-Key": "fake"}
    response = client.post("/learning-path/generate", json=context().model_dump(), headers=headers)
    assert response.status_code == 200
    assert len(calls) == 1
    assert response.json() == {"candidateIds": ["x0", "x1", "x2", "x3"]}
