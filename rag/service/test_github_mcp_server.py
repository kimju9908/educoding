"""Tests for github_mcp_server.py's own scope enforcement -- the part that has to
hold even if github_graph.py's prompt/validation layer has a bug, since this is
where the allow-list, author filter and exclusion rules actually live (see
docs/github-diagnosis.md section 2: "that guarantee lives in this server's
execution code, not in a tool description"). requests.get is faked; this cannot
show the real GitHub REST API behaves as assumed -- see github-diagnosis.md's
"검증의 범위" for what is still unverified end-to-end.
"""
import base64
import json

import pytest

import github_mcp_server as srv


@pytest.fixture(autouse=True)
def scope(monkeypatch):
    monkeypatch.setattr(srv, "INSTALLATION_TOKEN", "ghs_test_token")
    monkeypatch.setattr(srv, "COMMIT_AUTHOR_LOGIN", "octocat")
    monkeypatch.setattr(srv, "ALLOWED_REPOS", [srv.AllowedRepo(owner="octocat", repo="hello-world", head_sha="a" * 40)])
    monkeypatch.setitem(srv._calls, "list", 0)
    monkeypatch.setitem(srv._calls, "file", 0)
    monkeypatch.setitem(srv._calls, "commit", 0)


class FakeResponse:
    def __init__(self, status_code, payload, headers=None):
        self.status_code = status_code
        self._payload = payload
        self.headers = headers or {}

    def json(self):
        return self._payload

    @property
    def ok(self):
        return self.status_code < 400

    @property
    def text(self):
        return json.dumps(self._payload)

    def raise_for_status(self):
        if self.status_code >= 400:
            raise RuntimeError(f"http {self.status_code}")


def mock_get(monkeypatch, handler):
    monkeypatch.setattr(srv.requests, "get", handler)


def mock_post(monkeypatch, handler):
    monkeypatch.setattr(srv.requests, "post", handler)


def mock_patch(monkeypatch, handler):
    monkeypatch.setattr(srv.requests, "patch", handler)


def write_scope(monkeypatch, owner="octocat", repo="hello-world", branch="main", base_path="python"):
    monkeypatch.setattr(srv, "WRITE_OWNER", owner)
    monkeypatch.setattr(srv, "WRITE_REPO", repo)
    monkeypatch.setattr(srv, "WRITE_BRANCH", branch)
    monkeypatch.setattr(srv, "WRITE_BASE_PATH", base_path)


# ---- scope boundary: the actual guarantee --------------------------------------

def test_find_allowed_rejects_repo_outside_allow_list():
    with pytest.raises(ValueError, match="허용된 저장소가 아닙니다"):
        srv._find_allowed("someone-else", "private-repo")


def test_find_allowed_accepts_exact_match():
    repo = srv._find_allowed("octocat", "hello-world")
    assert repo.head_sha == "a" * 40


def test_tools_reject_unlisted_repo_without_calling_github(monkeypatch):
    calls = []
    mock_get(monkeypatch, lambda *a, **k: calls.append((a, k)) or FakeResponse(200, {}))

    with pytest.raises(ValueError):
        srv.list_directory(owner="someone-else", repo="private-repo", path="")
    with pytest.raises(ValueError):
        srv.get_file_content(owner="someone-else", repo="private-repo", path="x")
    with pytest.raises(ValueError):
        srv.list_commits(owner="someone-else", repo="private-repo")

    assert calls == []  # never reached the GitHub API


def test_requires_installation_token_and_allowed_repos(monkeypatch):
    monkeypatch.setattr(srv, "INSTALLATION_TOKEN", "")
    with pytest.raises(RuntimeError, match="installation token"):
        srv.list_repositories()


# ---- exclusion rules -----------------------------------------------------------

@pytest.mark.parametrize("path", [
    "node_modules/left-pad/index.js", "vendor/lib.php", "dist/bundle.js",
    "package-lock.json", "yarn.lock", "app.min.js", ".env.production",
    "src/main/resources/id_rsa", "config/secret_key.yml", "build/output.class",
    "assets/logo.png",
])
def test_excluded_paths(path):
    assert srv._is_excluded(path) is True


@pytest.mark.parametrize("path", ["src/main.py", "app/components/Button.tsx", "README.md"])
def test_non_excluded_paths(path):
    assert srv._is_excluded(path) is False


# ---- list_directory / get_file_content pin to the fixed HEAD sha, filter entries --

def test_list_directory_pins_ref_to_head_sha_and_filters_excluded_entries(monkeypatch):
    seen = {}

    def fake_get(url, headers=None, params=None, timeout=None):
        seen["url"], seen["params"] = url, params
        return FakeResponse(200, [
            {"name": "main.py", "path": "main.py", "type": "file", "size": 100},
            {"name": "node_modules", "path": "node_modules", "type": "dir", "size": 0},
            {"name": "package-lock.json", "path": "package-lock.json", "type": "file", "size": 500},
        ])

    mock_get(monkeypatch, fake_get)

    result = json.loads(srv.list_directory(owner="octocat", repo="hello-world", path=""))

    assert seen["params"] == {"ref": "a" * 40}
    assert [e["path"] for e in result["entries"]] == ["main.py"]
    assert "2개" in result["excludedNotice"]


def test_get_file_content_decodes_base64_text(monkeypatch):
    content = "print('hi')"
    mock_get(monkeypatch, lambda *a, **k: FakeResponse(200, {
        "size": len(content), "encoding": "base64",
        "content": base64.b64encode(content.encode()).decode(),
    }))

    result = json.loads(srv.get_file_content(owner="octocat", repo="hello-world", path="main.py"))

    assert result["content"] == content
    assert result["commitSha"] == "a" * 40


def test_get_file_content_rejects_file_over_size_cap(monkeypatch):
    mock_get(monkeypatch, lambda *a, **k: FakeResponse(200, {
        "size": srv.MAX_FILE_BYTES + 1, "encoding": "base64", "content": "",
    }))

    with pytest.raises(ValueError, match="상한"):
        srv.get_file_content(owner="octocat", repo="hello-world", path="big.py")


def test_get_file_content_rejects_undecodable_binary(monkeypatch):
    binary = bytes([0xFF, 0xFE, 0x00, 0x10])
    mock_get(monkeypatch, lambda *a, **k: FakeResponse(200, {
        "size": len(binary), "encoding": "base64", "content": base64.b64encode(binary).decode(),
    }))

    with pytest.raises(ValueError, match="바이너리"):
        srv.get_file_content(owner="octocat", repo="hello-world", path="image.dat")


def test_get_file_content_rejects_excluded_path_before_any_request(monkeypatch):
    calls = []
    mock_get(monkeypatch, lambda *a, **k: calls.append(1) or FakeResponse(200, {}))

    with pytest.raises(ValueError):
        srv.get_file_content(owner="octocat", repo="hello-world", path=".env")

    assert calls == []


# ---- commits are filtered to the connected account, never the repo owner -------

def test_list_commits_filters_by_connected_author(monkeypatch):
    seen = {}

    def fake_get(url, headers=None, params=None, timeout=None):
        seen["params"] = params
        return FakeResponse(200, [{
            "sha": "c" * 40, "commit": {"message": "fix bug\n\nlonger body", "author": {"date": "2026-01-01T00:00:00Z"}},
            "author": {"login": "octocat"},
        }])

    mock_get(monkeypatch, fake_get)

    result = json.loads(srv.list_commits(owner="octocat", repo="hello-world"))

    assert seen["params"]["author"] == "octocat"
    assert seen["params"]["sha"] == "a" * 40
    assert result[0]["message"] == "fix bug"


def test_get_commit_rejects_commit_authored_by_someone_else(monkeypatch):
    mock_get(monkeypatch, lambda *a, **k: FakeResponse(200, {
        "commit": {"message": "team commit", "author": {"date": "2026-01-01T00:00:00Z"}},
        "author": {"login": "teammate"}, "files": [],
    }))

    with pytest.raises(ValueError, match="작성한 커밋이 아니라"):
        srv.get_commit(owner="octocat", repo="hello-world", sha="d" * 40)


def test_get_commit_accepted_for_connected_author_filters_excluded_files(monkeypatch):
    mock_get(monkeypatch, lambda *a, **k: FakeResponse(200, {
        "commit": {"message": "add feature", "author": {"date": "2026-01-01T00:00:00Z"}},
        "author": {"login": "octocat"},
        "files": [
            {"filename": "main.py", "status": "modified", "additions": 2, "deletions": 1, "patch": "+x"},
            {"filename": "yarn.lock", "status": "modified", "additions": 1, "deletions": 1, "patch": "+y"},
        ],
    }))

    result = json.loads(srv.get_commit(owner="octocat", repo="hello-world", sha="c" * 40))

    assert [f["path"] for f in result["files"]] == ["main.py"]


# ---- budget caps enforced server-side, independent of the agent loop -----------

def test_list_directory_call_cap_enforced(monkeypatch):
    mock_get(monkeypatch, lambda *a, **k: FakeResponse(200, []))
    monkeypatch.setattr(srv, "MAX_LIST_CALLS", 1)

    srv.list_directory(owner="octocat", repo="hello-world", path="")
    with pytest.raises(ValueError, match="상한을 넘었습니다"):
        srv.list_directory(owner="octocat", repo="hello-world", path="sub")


# ---- upload_solution: the one write tool, and the only thing that touches it is
# the server's own job runner -- these tests are about the scope/conflict guarantees
# that hold regardless of what caller invokes it (see docs/github-auto-commit.md §2) --

def upload_kwargs(**overrides):
    args = dict(
        owner="octocat", repo="hello-world", branch="main",
        solution_path="python/0001-foo/solution.py", solution_content="print(1)",
        readme_path="python/0001-foo/README.md", readme_content="# foo",
        commit_message="Add solution for foo", author_name="octocat",
        author_email="123+octocat@users.noreply.github.com", expected_base_sha="base000",
    )
    args.update(overrides)
    return args


def test_upload_solution_rejects_target_outside_configured_scope(monkeypatch):
    write_scope(monkeypatch)
    with pytest.raises(ValueError, match="허용된 대상이 아닙니다"):
        srv.upload_solution(**upload_kwargs(repo="someone-elses-repo"))


def test_upload_solution_rejects_path_outside_base_path(monkeypatch):
    write_scope(monkeypatch, base_path="python")
    with pytest.raises(ValueError, match="허용된 경로"):
        srv.upload_solution(**upload_kwargs(solution_path="javascript/0001-foo/solution.js"))


def test_upload_solution_rejects_path_traversal(monkeypatch):
    write_scope(monkeypatch, base_path="python")
    with pytest.raises(ValueError, match="허용된 경로"):
        srv.upload_solution(**upload_kwargs(readme_path="python/../../etc/passwd"))


def test_upload_solution_rejects_when_branch_moved_since_job_started(monkeypatch):
    write_scope(monkeypatch)
    mock_get(monkeypatch, lambda url, **k: FakeResponse(200, {"object": {"sha": "different-current-sha"}}))

    with pytest.raises(ValueError, match="\\[CONFLICT\\]"):
        srv.upload_solution(**upload_kwargs(expected_base_sha="base000"))


def test_upload_solution_rejects_when_tracked_file_was_manually_changed(monkeypatch):
    write_scope(monkeypatch)

    def fake_get(url, **k):
        if url.endswith("/git/ref/heads/main"):
            return FakeResponse(200, {"object": {"sha": "base000"}})
        return FakeResponse(200, {"sha": "someone-elses-edit-sha"})  # contents lookup

    mock_get(monkeypatch, fake_get)

    with pytest.raises(ValueError, match="\\[CONFLICT\\]"):
        srv.upload_solution(**upload_kwargs(expected_solution_sha="original-sha"))


def test_upload_solution_rejects_when_tracked_file_was_deleted(monkeypatch):
    write_scope(monkeypatch)

    def fake_get(url, **k):
        if url.endswith("/git/ref/heads/main"):
            return FakeResponse(200, {"object": {"sha": "base000"}})
        return FakeResponse(404, None)

    mock_get(monkeypatch, fake_get)

    with pytest.raises(ValueError, match="\\[CONFLICT\\]"):
        srv.upload_solution(**upload_kwargs(expected_solution_sha="original-sha"))


def test_upload_solution_succeeds_with_atomic_blob_tree_commit_ref_sequence(monkeypatch):
    write_scope(monkeypatch)
    posts = []

    def fake_get(url, **k):
        if url.endswith("/git/ref/heads/main"):
            return FakeResponse(200, {"object": {"sha": "base000"}})
        if url.endswith("/git/commits/base000"):
            return FakeResponse(200, {"tree": {"sha": "basetree000"}})
        raise AssertionError(f"unexpected GET {url}")

    def fake_post(url, headers=None, json=None, timeout=None):
        posts.append((url, json))
        if url.endswith("/git/blobs"):
            return FakeResponse(201, {"sha": f"blob-{len(posts)}"})
        if url.endswith("/git/trees"):
            return FakeResponse(201, {"sha": "newtree000"})
        if url.endswith("/git/commits"):
            return FakeResponse(201, {"sha": "newcommit000"})
        raise AssertionError(f"unexpected POST {url}")

    ref_updates = []

    def fake_patch(url, headers=None, json=None, timeout=None):
        ref_updates.append(json)
        return FakeResponse(200, {"ref": "refs/heads/main", "object": {"sha": json["sha"]}})

    mock_get(monkeypatch, fake_get)
    mock_post(monkeypatch, fake_post)
    mock_patch(monkeypatch, fake_patch)

    result = json.loads(srv.upload_solution(**upload_kwargs()))

    assert result["commitSha"] == "newcommit000"
    assert result["commitUrl"] == "https://github.com/octocat/hello-world/commit/newcommit000"
    assert result["solutionSha"] == "blob-1"
    assert ref_updates == [{"sha": "newcommit000", "force": False}]  # force=false is the concurrency guard
    tree_call = next(b for u, b in posts if u.endswith("/git/trees"))
    assert tree_call["base_tree"] == "basetree000"
    assert {e["path"] for e in tree_call["tree"]} == {upload_kwargs()["solution_path"], upload_kwargs()["readme_path"]}
    commit_call = next(b for u, b in posts if u.endswith("/git/commits"))
    assert commit_call["author"]["email"] == "123+octocat@users.noreply.github.com"
    assert commit_call["parents"] == ["base000"]


def test_upload_solution_classifies_rate_limit_as_transient(monkeypatch):
    write_scope(monkeypatch)
    mock_get(monkeypatch, lambda url, **k: FakeResponse(403, {}, headers={"X-RateLimit-Remaining": "0"}))

    with pytest.raises(ValueError, match="\\[TRANSIENT\\]"):
        srv.upload_solution(**upload_kwargs())


def test_upload_solution_classifies_non_fast_forward_ref_update_as_conflict(monkeypatch):
    write_scope(monkeypatch)

    def fake_get(url, **k):
        if url.endswith("/git/ref/heads/main"):
            return FakeResponse(200, {"object": {"sha": "base000"}})
        return FakeResponse(200, {"tree": {"sha": "basetree000"}})

    mock_get(monkeypatch, fake_get)
    mock_post(monkeypatch, lambda url, **k: FakeResponse(201, {"sha": "x"}))
    mock_patch(monkeypatch, lambda url, **k: FakeResponse(422, {"message": "Update is not a fast forward"}))

    with pytest.raises(ValueError, match="\\[CONFLICT\\]"):
        srv.upload_solution(**upload_kwargs())
