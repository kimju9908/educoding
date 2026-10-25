"""Tests for github_graph.py (GitHub code diagnosis agent) and /github/diagnose.

ChatAnthropic and the MCP session are both faked -- this cannot show that a real
Claude run against a real GitHub repo produces a GOOD diagnosis, or that the
real github_mcp_server.py subprocess actually enforces its allow-list against
the live GitHub API (see test_github_mcp_server.py for that, and
docs/github-diagnosis.md for what is still unverified end-to-end). What these
tests cover: the forced-tool loop mechanics, and -- the part unique to this
agent -- that evidenceRefs/recommendedTopics get rejected unless they match
what tool calls actually returned in THIS run, never what the model claims.
"""
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient
from langchain_core.messages import AIMessage, ToolMessage

import github_graph
import main
import retrieval
from github_graph import AllowedRepo, DiagnosisContext, DiagnosisFormatError, _Run

REPO_A = AllowedRepo(owner="octocat", repo="hello-world", headSha="a" * 40)
REPO_B = AllowedRepo(owner="octocat", repo="second-repo", headSha="b" * 40)


def context(**overrides):
    data = dict(allowedRepos=[REPO_A], githubLogin="octocat",
                allowedConcepts=["반복문", "비동기 처리"])
    data.update(overrides)
    return DiagnosisContext(**data)


def valid_diagnosis(**overrides):
    draft = {
        "confirmed": [{
            "concept": "반복문 활용", "evidenceSummary": "main.py에서 for 루프로 입력을 처리함",
            "evidenceRefs": [{"owner": "octocat", "repo": "hello-world", "path": "main.py"}],
            "limits": "이 저장소 한 곳만 확인함",
        }],
        "gaps": [{"concept": "테스트 코드", "note": "테스트 파일을 찾지 못함"}],
        "recommendedTopics": [{"concept": "반복문", "reason": "반복문 사용 경험을 더 다져볼 만함"}],
        "scopeNote": "hello-world 저장소의 루트 디렉터리와 main.py만 확인함",
    }
    draft.update(overrides)
    return draft


def minimal_diagnosis(**overrides):
    """A submit_diagnosis payload with no confirmed/evidenceRefs at all -- for tests
    that aren't about evidence validation and whose scripted tool calls never
    actually fetch valid_diagnosis()'s default "main.py" evidence first (which
    would otherwise get rejected and need yet another scripted response)."""
    return valid_diagnosis(confirmed=[], **overrides)


def call(name, args, call_id):
    return AIMessage(content=[{"type": "text", "text": ""}],
                     tool_calls=[{"name": name, "args": args, "id": call_id}])


def mcp_result(text, is_error=False):
    return SimpleNamespace(content=[SimpleNamespace(text=text)], isError=is_error)


class FakeMcpSession:
    def __init__(self, tool_defs, handler):
        self._tool_defs = tool_defs
        self._handler = handler
        self.calls = []

    async def initialize(self):
        pass

    async def list_tools(self):
        return SimpleNamespace(tools=[
            SimpleNamespace(name=n, description=d, inputSchema=s) for n, d, s in self._tool_defs
        ])

    async def call_tool(self, name, args):
        self.calls.append((name, args))
        return self._handler(name, args)


class _AsyncCtx:
    def __init__(self, value):
        self._value = value

    async def __aenter__(self):
        return self._value

    async def __aexit__(self, *exc):
        return False


DEFAULT_TOOL_DEFS = [
    ("list_repositories", "허용된 저장소 목록", {"type": "object", "properties": {}}),
    ("list_directory", "디렉터리 나열", {"type": "object", "properties": {
        "owner": {"type": "string"}, "repo": {"type": "string"}, "path": {"type": "string"}}}),
    ("get_file_content", "파일 내용", {"type": "object", "properties": {
        "owner": {"type": "string"}, "repo": {"type": "string"}, "path": {"type": "string"}}}),
    ("list_commits", "커밋 목록", {"type": "object", "properties": {
        "owner": {"type": "string"}, "repo": {"type": "string"}, "path": {"type": "string"}}}),
    ("get_commit", "커밋 상세", {"type": "object", "properties": {
        "owner": {"type": "string"}, "repo": {"type": "string"}, "sha": {"type": "string"}}}),
]


def default_handler(name, args):
    if name == "list_repositories":
        return mcp_result('[{"owner": "octocat", "repo": "hello-world", "headSha": "' + "a" * 40 + '"}]')
    if name == "list_directory":
        return mcp_result(
            '{"owner": "octocat", "repo": "hello-world", "path": "", '
            '"entries": [{"name": "main.py", "path": "main.py", "type": "file", "sizeBytes": 120}]}')
    if name == "get_file_content":
        return mcp_result(
            '{"owner": "octocat", "repo": "hello-world", "path": "main.py", '
            '"commitSha": "' + "a" * 40 + '", "content": "for i in range(3): print(i)"}')
    if name == "list_commits":
        return mcp_result('[{"sha": "' + "c" * 40 + '", "message": "add loop", '
                           '"authorLogin": "octocat", "date": "2026-01-01T00:00:00Z"}]')
    if name == "get_commit":
        return mcp_result(
            '{"owner": "octocat", "repo": "hello-world", "sha": "' + "c" * 40 + '", '
            '"message": "add loop", "date": "2026-01-01T00:00:00Z", '
            '"files": [{"path": "main.py", "status": "modified", "additions": 1, "deletions": 0, "patch": "+for"}]}')
    return mcp_result(f"오류: 알 수 없는 도구 {name}", is_error=True)


class FakeBound:
    def __init__(self, log, responses, tool_choice):
        self._log, self._responses, self.tool_choice = log, responses, tool_choice

    async def ainvoke(self, messages):
        self._log.append({"messages": list(messages), "tool_choice": self.tool_choice})
        return self._responses.pop(0)


class FakeChatAnthropic:
    def __init__(self, responses):
        self.calls, self._responses, self.init_kwargs = [], list(responses), []

    def bind_tools(self, tools, tool_choice=None, **kwargs):
        self.bound_tool_names = [t["name"] for t in tools]
        return FakeBound(self.calls, self._responses, tool_choice)


def mock_claude(monkeypatch, responses):
    fake = FakeChatAnthropic(responses)

    def factory(**kwargs):
        fake.init_kwargs.append(kwargs)
        return fake

    monkeypatch.setattr(github_graph, "ChatAnthropic", factory)
    return fake


def mock_mcp(monkeypatch, handler=default_handler, tool_defs=DEFAULT_TOOL_DEFS):
    session = FakeMcpSession(tool_defs, handler)
    monkeypatch.setattr(github_graph, "stdio_client", lambda params: _AsyncCtx((None, None)))
    monkeypatch.setattr(github_graph, "ClientSession", lambda read, write: _AsyncCtx(session))
    return session


FORCE_LIST_REPOS = {"type": "tool", "name": "list_repositories"}
FORCE_SUBMIT = {"type": "tool", "name": "submit_diagnosis"}


# ---- happy path ---------------------------------------------------------------

@pytest.mark.asyncio
async def test_forces_list_repositories_first_then_auto_then_accepts_valid_diagnosis(monkeypatch):
    mock_mcp(monkeypatch)
    fake = mock_claude(monkeypatch, [
        call("list_repositories", {}, "t1"),
        call("get_file_content", {"owner": "octocat", "repo": "hello-world", "path": "main.py"}, "t2"),
        call("submit_diagnosis", valid_diagnosis(), "t3"),
    ])

    result = await github_graph.run_diagnosis(context(), "ghs_token", "sk-test", "claude-sonnet-5")

    assert fake.calls[0]["tool_choice"] == FORCE_LIST_REPOS
    assert fake.calls[1]["tool_choice"] is None
    assert result.confirmed[0].concept == "반복문 활용"
    assert result.recommendedTopics[0].concept == "반복문"
    assert result.actualScope.fileReadCalls == 1


@pytest.mark.asyncio
async def test_mcp_tools_are_converted_with_submit_diagnosis_appended(monkeypatch):
    mock_mcp(monkeypatch)
    fake = mock_claude(monkeypatch, [
        call("list_repositories", {}, "t1"),
        call("submit_diagnosis", minimal_diagnosis(), "t2"),
    ])

    await github_graph.run_diagnosis(context(), "ghs_token", "sk-test", "claude-sonnet-5")

    assert "list_repositories" in fake.bound_tool_names
    assert "get_file_content" in fake.bound_tool_names
    assert "submit_diagnosis" in fake.bound_tool_names


# ---- evidence must come from real tool results, not the model -----------------

@pytest.mark.asyncio
async def test_evidence_ref_for_a_path_never_read_is_rejected_then_corrected(monkeypatch):
    mock_mcp(monkeypatch)
    bad = valid_diagnosis(confirmed=[{
        "concept": "반복문 활용", "evidenceSummary": "실제로 조회하지 않은 파일",
        "evidenceRefs": [{"owner": "octocat", "repo": "hello-world", "path": "never_fetched.py"}],
        "limits": "근거 약함",
    }])
    fake = mock_claude(monkeypatch, [
        call("list_repositories", {}, "t1"),
        call("submit_diagnosis", bad, "t2"),
        call("submit_diagnosis", minimal_diagnosis(), "t3"),
    ])

    result = await github_graph.run_diagnosis(context(), "ghs_token", "sk-test", "claude-sonnet-5")

    rejection = tool_results(fake, 2)[-1].content
    assert "조회하지 않은 경로" in rejection and "never_fetched.py" in rejection
    assert result.confirmed == []


@pytest.mark.asyncio
async def test_evidence_ref_outside_allowed_repo_is_rejected(monkeypatch):
    # Budget exhausted right after the rejection (no further agent call to feed the
    # correction into), so -- like review_graph's own "never valid" test -- this only
    # asserts the run never accepts it, not the exact rejection text.
    mock_mcp(monkeypatch)
    bad = valid_diagnosis(confirmed=[{
        "concept": "x", "evidenceSummary": "다른 저장소를 근거로 사용",
        "evidenceRefs": [{"owner": "someone-else", "repo": "private-repo", "path": "secret.py"}],
        "limits": "근거 약함",
    }])
    mock_claude(monkeypatch, [
        call("list_repositories", {}, "t1"),
        call("submit_diagnosis", bad, "t2"),
    ])

    with pytest.raises(DiagnosisFormatError):
        await github_graph.run_diagnosis(context(), "ghs_token", "sk-test", "claude-sonnet-5", max_agent_calls=2)


@pytest.mark.asyncio
async def test_evidence_ref_with_unverified_commit_sha_is_rejected_then_corrected(monkeypatch):
    mock_mcp(monkeypatch)
    bad = valid_diagnosis(confirmed=[{
        "concept": "x", "evidenceSummary": "조회하지 않은 커밋",
        "evidenceRefs": [{"owner": "octocat", "repo": "hello-world", "path": "main.py", "commitSha": "d" * 40}],
        "limits": "근거 약함",
    }])
    good = valid_diagnosis(confirmed=[{
        "concept": "x", "evidenceSummary": "실제로 조회한 커밋",
        "evidenceRefs": [{"owner": "octocat", "repo": "hello-world", "path": "main.py", "commitSha": "c" * 40}],
        "limits": "근거 있음",
    }])
    fake = mock_claude(monkeypatch, [
        call("list_repositories", {}, "t1"),
        call("get_commit", {"owner": "octocat", "repo": "hello-world", "sha": "c" * 40}, "t2"),
        call("submit_diagnosis", bad, "t3"),
        call("submit_diagnosis", good, "t4"),
    ])

    result = await github_graph.run_diagnosis(context(), "ghs_token", "sk-test", "claude-sonnet-5")

    rejection = tool_results(fake, 3)[-1].content
    assert "조회하지 않은 커밋" in rejection
    assert result.confirmed[0].evidenceRefs[0].commitSha == "c" * 40


@pytest.mark.asyncio
async def test_evidence_ref_with_verified_commit_sha_is_accepted(monkeypatch):
    mock_mcp(monkeypatch)
    good = valid_diagnosis(confirmed=[{
        "concept": "x", "evidenceSummary": "실제로 조회한 커밋",
        "evidenceRefs": [{"owner": "octocat", "repo": "hello-world", "path": "main.py", "commitSha": "c" * 40}],
        "limits": "근거 있음",
    }])
    mock_claude(monkeypatch, [
        call("list_repositories", {}, "t1"),
        call("get_commit", {"owner": "octocat", "repo": "hello-world", "sha": "c" * 40}, "t2"),
        call("submit_diagnosis", good, "t3"),
    ])

    result = await github_graph.run_diagnosis(context(), "ghs_token", "sk-test", "claude-sonnet-5")

    assert result.confirmed[0].evidenceRefs[0].commitSha == "c" * 40


# ---- recommendedTopics is a closed, server-supplied vocabulary ----------------

@pytest.mark.asyncio
async def test_recommended_topic_outside_allowed_concepts_is_rejected_then_corrected(monkeypatch):
    mock_mcp(monkeypatch)
    bad = minimal_diagnosis(recommendedTopics=[{"concept": "양자컴퓨팅", "reason": "모델이 지어냄"}])
    fake = mock_claude(monkeypatch, [
        call("list_repositories", {}, "t1"),
        call("submit_diagnosis", bad, "t2"),
        call("submit_diagnosis", minimal_diagnosis(), "t3"),
    ])

    result = await github_graph.run_diagnosis(context(), "ghs_token", "sk-test", "claude-sonnet-5")

    rejection = tool_results(fake, 2)[-1].content
    assert "허용된 개념 목록에 없습니다" in rejection
    assert result.recommendedTopics[0].concept == "반복문"


# ---- the installation token never reaches a model message ---------------------

@pytest.mark.asyncio
async def test_installation_token_never_appears_in_model_messages(monkeypatch):
    mock_mcp(monkeypatch)
    fake = mock_claude(monkeypatch, [
        call("list_repositories", {}, "t1"),
        call("submit_diagnosis", minimal_diagnosis(), "t2"),
    ])

    await github_graph.run_diagnosis(context(), "ghs_super_secret_token", "sk-test", "claude-sonnet-5")

    for logged in fake.calls:
        for message in logged["messages"]:
            assert "ghs_super_secret_token" not in str(message.content)


# ---- loop limits (mirrors review_graph's forced-tool mechanics) ---------------

@pytest.mark.asyncio
async def test_plain_text_reply_forces_submit_diagnosis_next(monkeypatch):
    mock_mcp(monkeypatch)
    fake = mock_claude(monkeypatch, [
        call("list_repositories", {}, "t1"),
        AIMessage(content="그냥 글로 답합니다."),
        call("submit_diagnosis", minimal_diagnosis(), "t3"),
    ])

    await github_graph.run_diagnosis(context(), "ghs_token", "sk-test", "claude-sonnet-5")

    assert fake.calls[2]["tool_choice"] == FORCE_SUBMIT


@pytest.mark.asyncio
async def test_time_budget_exceeded_forces_submit_diagnosis(monkeypatch):
    mock_mcp(monkeypatch)
    fake = mock_claude(monkeypatch, [
        call("list_repositories", {}, "t1"),
        call("submit_diagnosis", minimal_diagnosis(), "t2"),
    ])
    # Unlike review_graph's sync equivalent test, this runs inside an event loop --
    # asyncio/langgraph/pytest's own internals also call time.monotonic(), so a
    # strict finite iter() here would raise StopIteration on an unrelated call.
    # Clamping to the last scripted value instead is safe for those extra callers
    # (they don't compare against our deadline) while still driving our own checks.
    tick_values = [0.0, 999.0]
    calls_made = {"n": 0}

    def fake_monotonic():
        value = tick_values[min(calls_made["n"], len(tick_values) - 1)]
        calls_made["n"] += 1
        return value

    monkeypatch.setattr(github_graph.time, "monotonic", fake_monotonic)

    await github_graph.run_diagnosis(context(), "ghs_token", "sk-test", "claude-sonnet-5", time_budget_seconds=10)

    assert fake.calls[1]["tool_choice"] == FORCE_SUBMIT


@pytest.mark.asyncio
async def test_tool_calls_beyond_per_turn_cap_are_not_executed(monkeypatch):
    mock_mcp(monkeypatch)
    many = [("list_directory", {"owner": "octocat", "repo": "hello-world", "path": f"d{i}"}, f"c{i}") for i in range(6)]
    fake = mock_claude(monkeypatch, [
        call("list_repositories", {}, "t1"),
        AIMessage(content=[{"type": "text", "text": ""}],
                  tool_calls=[{"name": n, "args": a, "id": i} for n, a, i in many]),
        call("submit_diagnosis", valid_diagnosis(), "t3"),
    ])

    await github_graph.run_diagnosis(context(), "ghs_token", "sk-test", "claude-sonnet-5")

    results = tool_results(fake, 2)[-6:]
    assert len(results) == 6
    assert sum("초과" in r.content for r in results) == 2


@pytest.mark.asyncio
async def test_never_producing_a_valid_diagnosis_raises_format_error(monkeypatch):
    mock_mcp(monkeypatch)
    broken = {}  # missing the required scopeNote -- structurally invalid, not just empty lists
    mock_claude(monkeypatch, [
        call("list_repositories", {}, "t1"),
        call("submit_diagnosis", broken, "t2"),
        call("submit_diagnosis", broken, "t3"),
    ])

    with pytest.raises(DiagnosisFormatError):
        await github_graph.run_diagnosis(context(), "ghs_token", "sk-test", "claude-sonnet-5", max_agent_calls=3)


def tool_results(fake, call_index):
    return [m for m in fake.calls[call_index]["messages"] if isinstance(m, ToolMessage)]


# ---- _Run.execute: MCP tool errors and unknown args ----------------------------

@pytest.mark.asyncio
async def test_mcp_tool_error_is_prefixed_and_marks_truncated_on_budget_message(monkeypatch):
    session = mock_mcp(monkeypatch, handler=lambda n, a: mcp_result(
        "이번 분석에서 디렉터리 조회 횟수 상한을 넘었습니다.", is_error=True))

    async def run_it():
        async with github_graph.stdio_client(None) as (r, w):
            async with github_graph.ClientSession(r, w) as sess:
                run = _Run(sess, context())
                text = await run.execute("list_directory", {"owner": "octocat", "repo": "hello-world", "path": ""})
                return run, text

    run, text = await run_it()
    assert text.startswith("오류:")
    assert run.truncated is True


@pytest.mark.asyncio
async def test_non_dict_args_returns_error_without_calling_mcp(monkeypatch):
    session = mock_mcp(monkeypatch)
    async with github_graph.stdio_client(None) as (r, w):
        async with github_graph.ClientSession(r, w) as sess:
            run = _Run(sess, context())
            result = await run.execute("get_file_content", "not-a-dict")
    assert result.startswith("오류")
    assert session.calls == []


# ---- /github/diagnose endpoint -------------------------------------------------

@pytest.fixture
def no_auth(monkeypatch):
    monkeypatch.setattr(retrieval, "RAG_X_API_KEY", None)
    monkeypatch.setattr(retrieval, "RAG_X_CLIENT_ID", None)


@pytest.fixture
def client():
    return TestClient(main.app)


def request_body():
    return context().model_dump()


def test_endpoint_requires_installation_token(no_auth, client):
    response = client.post("/github/diagnose", json=request_body(), headers={"X-Anthropic-Api-Key": "sk"})
    assert response.status_code == 503


def test_endpoint_requires_anthropic_key(no_auth, client):
    response = client.post("/github/diagnose", json=request_body(),
                            headers={"X-Github-Installation-Token": "ghs_token"})
    assert response.status_code == 503


def test_endpoint_returns_validated_diagnosis(no_auth, monkeypatch, client):
    mock_mcp(monkeypatch)
    mock_claude(monkeypatch, [
        call("list_repositories", {}, "t1"),
        call("submit_diagnosis", minimal_diagnosis(), "t2"),
    ])

    response = client.post("/github/diagnose", json=request_body(),
                            headers={"X-Anthropic-Api-Key": "sk", "X-Github-Installation-Token": "ghs_token"})

    assert response.status_code == 200
    body = response.json()
    assert body["recommendedTopics"][0]["concept"] == "반복문"
    assert body["actualScope"]["reposAnalyzed"][0]["owner"] == "octocat"


def test_endpoint_maps_format_error_to_502(no_auth, monkeypatch, client):
    async def fail(*args, **kwargs):
        raise DiagnosisFormatError("never valid")

    monkeypatch.setattr(github_graph, "run_diagnosis", fail)

    response = client.post("/github/diagnose", json=request_body(),
                            headers={"X-Anthropic-Api-Key": "sk", "X-Github-Installation-Token": "ghs_token"})

    assert response.status_code == 502
    assert "format error" in response.json()["detail"]


def test_endpoint_rejects_more_than_three_repos(no_auth, client):
    body = request_body()
    body["allowedRepos"] = [REPO_A.model_dump(), REPO_B.model_dump(),
                             {"owner": "o", "repo": "r3", "headSha": "e" * 40},
                             {"owner": "o", "repo": "r4", "headSha": "f" * 40}]

    response = client.post("/github/diagnose", json=body,
                            headers={"X-Anthropic-Api-Key": "sk", "X-Github-Installation-Token": "ghs_token"})

    assert response.status_code == 422
