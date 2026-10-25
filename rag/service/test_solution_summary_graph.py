"""Tests for solution_summary_graph.py and /solution-summary/generate.

No agent loop here (see the module docstring for why) -- these tests are about
the single forced-tool call, structural validation, and that an existing
review's content never substitutes for an actual model response.
"""
import pytest
from fastapi.testclient import TestClient

import main
import retrieval
import solution_summary_graph
from solution_summary_graph import (
    ChallengeContext,
    ExistingReview,
    SubmissionContext,
    SummaryFormatError,
    SummaryRequest,
    run_summary,
)


def submission(**overrides):
    data = dict(judgmentId=42, language="PYTHON3", code="print(1+1)", maxElapsedTimeMs=5, maxMemoryUsageMb=10.0)
    data.update(overrides)
    return SubmissionContext(**data)


def challenge(**overrides):
    data = dict(challengeId=1, title="두 정수의 덧셈", description="두 정수의 합을 출력",
                condition="-100 <= x, y <= 100", category="산술 연산", difficulty="PRACTICE")
    data.update(overrides)
    return ChallengeContext(**data)


def valid_tool_input(**overrides):
    draft = {
        "approach": "입력 두 값을 더해 출력했습니다.",
        "timeComplexity": "O(1)", "spaceComplexity": "O(1)",
        "assumptions": ["입력은 정수 두 개"], "oneLineSummary": "두 정수를 더해 출력",
    }
    draft.update(overrides)
    return draft


class FakeToolUseBlock:
    type = "tool_use"

    def __init__(self, input_):
        self.input = input_


class FakeTextBlock:
    type = "text"
    text = ""


class FakeResponse:
    def __init__(self, content):
        self.content = content


class FakeMessages:
    def __init__(self, response):
        self._response = response
        self.calls = []

    def create(self, **kwargs):
        self.calls.append(kwargs)
        return self._response


class FakeAnthropic:
    def __init__(self, response):
        self.messages = FakeMessages(response)
        self.init_kwargs = {}


def mock_claude(monkeypatch, content):
    fake = FakeAnthropic(FakeResponse(content))

    def factory(**kwargs):
        fake.init_kwargs = kwargs
        return fake

    monkeypatch.setattr(solution_summary_graph.anthropic, "Anthropic", factory)
    return fake


# ---- happy path -----------------------------------------------------------------

def test_valid_tool_call_is_accepted_and_observed_metrics_come_from_the_submission(monkeypatch):
    mock_claude(monkeypatch, [FakeToolUseBlock(valid_tool_input())])

    result = run_summary(SummaryRequest(submission=submission(), challenge=challenge()), "sk-test", "claude-sonnet-5")

    assert result.oneLineSummary == "두 정수를 더해 출력"
    assert result.observedMetrics.maxElapsedTimeMs == 5
    assert result.observedMetrics.maxMemoryUsageMb == 10.0


def test_tool_choice_is_forced_to_submit_summary(monkeypatch):
    fake = mock_claude(monkeypatch, [FakeToolUseBlock(valid_tool_input())])

    run_summary(SummaryRequest(submission=submission(), challenge=challenge()), "sk-test", "claude-sonnet-5")

    call = fake.messages.calls[0]
    assert call["tool_choice"] == {"type": "tool", "name": "submit_summary"}
    assert call["tools"][0]["name"] == "submit_summary"


def test_secrets_never_appear_in_model_messages(monkeypatch):
    fake = mock_claude(monkeypatch, [FakeToolUseBlock(valid_tool_input())])

    run_summary(SummaryRequest(submission=submission(), challenge=challenge()), "sk-super-secret", "claude-sonnet-5")

    for call in fake.messages.calls:
        assert "sk-super-secret" not in str(call["messages"])
    assert fake.init_kwargs["api_key"] == "sk-super-secret"


# ---- no retry loop: one bad response is a hard failure --------------------------

def test_missing_tool_use_block_raises_format_error_without_retrying(monkeypatch):
    fake = mock_claude(monkeypatch, [FakeTextBlock()])

    with pytest.raises(SummaryFormatError):
        run_summary(SummaryRequest(submission=submission(), challenge=challenge()), "sk-test", "claude-sonnet-5")

    assert len(fake.messages.calls) == 1  # exactly one attempt -- no correction turn


def test_structurally_invalid_tool_input_raises_format_error(monkeypatch):
    mock_claude(monkeypatch, [FakeToolUseBlock({"approach": "짧게만"})])  # missing required fields

    with pytest.raises(SummaryFormatError):
        run_summary(SummaryRequest(submission=submission(), challenge=challenge()), "sk-test", "claude-sonnet-5")


# ---- existing review is context only, never a substitute for a real response ---

def test_existing_review_is_formatted_as_reference_data_not_injected_as_the_result(monkeypatch):
    fake = mock_claude(monkeypatch, [FakeToolUseBlock(valid_tool_input())])
    review = ExistingReview(summary="기존 리뷰 요약", complexityTime="O(n)", complexitySpace="O(1)", assumptions=["n은 입력 길이"])

    result = run_summary(
        SummaryRequest(submission=submission(), challenge=challenge(), existingReview=review),
        "sk-test", "claude-sonnet-5",
    )

    sent_content = fake.messages.calls[0]["messages"][0]["content"]
    assert "기존 리뷰 요약" in sent_content and "O(n)" in sent_content
    # the result is still whatever the (mocked) model actually returned, not the review's own text
    assert result.timeComplexity == "O(1)"


def test_no_existing_review_is_formatted_as_none(monkeypatch):
    fake = mock_claude(monkeypatch, [FakeToolUseBlock(valid_tool_input())])

    run_summary(SummaryRequest(submission=submission(), challenge=challenge()), "sk-test", "claude-sonnet-5")

    assert "없음" in fake.messages.calls[0]["messages"][0]["content"]


# ---- /solution-summary/generate endpoint ---------------------------------------

@pytest.fixture
def no_auth(monkeypatch):
    monkeypatch.setattr(retrieval, "RAG_X_API_KEY", None)
    monkeypatch.setattr(retrieval, "RAG_X_CLIENT_ID", None)


@pytest.fixture
def client():
    return TestClient(main.app)


def request_body():
    return {"submission": submission().model_dump(), "challenge": challenge().model_dump()}


def test_endpoint_requires_anthropic_key(no_auth, client):
    assert client.post("/solution-summary/generate", json=request_body()).status_code == 503


def test_endpoint_returns_validated_summary(no_auth, monkeypatch, client):
    mock_claude(monkeypatch, [FakeToolUseBlock(valid_tool_input())])

    response = client.post("/solution-summary/generate", json=request_body(), headers={"X-Anthropic-Api-Key": "sk"})

    assert response.status_code == 200
    assert response.json()["oneLineSummary"] == "두 정수를 더해 출력"


def test_endpoint_maps_format_error_to_502(no_auth, monkeypatch, client):
    def fail(*args, **kwargs):
        raise SummaryFormatError("never valid")

    monkeypatch.setattr(solution_summary_graph, "run_summary", fail)

    response = client.post("/solution-summary/generate", json=request_body(), headers={"X-Anthropic-Api-Key": "sk"})

    assert response.status_code == 502
    assert "format error" in response.json()["detail"]
