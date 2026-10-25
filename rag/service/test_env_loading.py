"""Regression tests for the .env-loading-order bug: main.py used to import
retrieval.py (whose module-level constants like TOP_K/RAG_X_API_KEY are read
from os.environ at *import time*) before calling load_dotenv(), so .env's
values never actually took effect -- TOP_K silently kept its hardcoded
default, and RAG_X_API_KEY/RAG_X_CLIENT_ID stayed None, which disables the
shared-secret auth check entirely (verify_auth(None, None) just returns).

Two things these have to get right to actually test the fix rather than just
look like they do:

- Run retrieval.py fresh in a *subprocess*, not import it in-process: pytest
  (or any earlier test file) may have already imported it, and Python caches
  imports, so a second `import retrieval` here wouldn't re-run its
  module-level code at all and would silently pass regardless of whether the
  bug is actually fixed. Each subprocess also gets a deliberately minimal
  environment (just PATH) so a variable already exported in the developer's
  own shell can't mask the bug either. Nothing about config loading itself is
  mocked -- that's the exact mechanism under test.

- Never touch the real rag/service/.env. retrieval.py's fix loads ".env next
  to wherever this module actually lives" (Path(__file__).resolve().parent),
  so each test copies retrieval.py into its own pytest tmp_path, writes a
  synthetic .env next to that copy, and points the subprocess's sys.path at
  tmp_path instead of the real service directory. retrieval.py has no local
  imports of its own (only stdlib + third-party packages), so copying that
  one file is a complete, working copy. This also means a test can be killed
  mid-run without ever having touched a real config file to restore.
"""
import os
import shutil
import subprocess
import sys
from pathlib import Path

import pytest

SERVICE_DIR = Path(__file__).resolve().parent
RETRIEVAL_SRC = SERVICE_DIR / "retrieval.py"


@pytest.fixture
def isolated_module_dir(tmp_path) -> Path:
    """A tmp_path containing its own copy of retrieval.py and nothing else --
    not even an .env, unless a test writes one. Real rag/service/.env is never
    read or written by anything in this file.
    """
    shutil.copy(RETRIEVAL_SRC, tmp_path / "retrieval.py")
    return tmp_path


def run_probe(module_dir: Path, code: str, extra_env: dict | None = None, cwd: Path | None = None) -> str:
    env = {"PATH": os.environ.get("PATH", "")}
    if extra_env:
        env.update(extra_env)
    result = subprocess.run(
        [sys.executable, "-c", f"import sys; sys.path.insert(0, {str(module_dir)!r}); {code}"],
        cwd=str(cwd or module_dir),
        env=env,
        capture_output=True,
        text=True,
        timeout=60,
    )
    assert result.returncode == 0, f"probe failed:\nstdout={result.stdout}\nstderr={result.stderr}"
    return result.stdout.strip()


def test_probe_imports_the_isolated_copy_not_the_real_service_module(isolated_module_dir):
    # Sanity check on the harness itself: if this ever imported the real
    # rag/service/retrieval.py instead of the tmp_path copy, every other test
    # in this file would silently be exercising (and risking mutating) the
    # real .env again despite appearing to use an isolated directory.
    output = run_probe(isolated_module_dir, "import retrieval; print(retrieval.__file__)")

    assert Path(output).resolve() == (isolated_module_dir / "retrieval.py").resolve()
    assert Path(output).resolve() != RETRIEVAL_SRC.resolve()


def test_env_file_value_overrides_hardcoded_default(isolated_module_dir):
    (isolated_module_dir / ".env").write_text("RAG_TOP_K=9\n", encoding="utf-8")

    output = run_probe(isolated_module_dir, "import retrieval; print(retrieval.TOP_K)")

    assert output == "9"


def test_env_file_value_is_read_regardless_of_launch_directory(isolated_module_dir, tmp_path_factory):
    (isolated_module_dir / ".env").write_text("RAG_TOP_K=7\n", encoding="utf-8")
    unrelated_cwd = tmp_path_factory.mktemp("unrelated-launch-dir")

    # Launched from a directory with no .env of its own, nowhere near the module copy --
    # if retrieval.py ever went back to relying on load_dotenv()'s default
    # upward-search-from-cwd behavior, this would silently fall back to the
    # hardcoded default instead of the isolated_module_dir's .env.
    output = run_probe(isolated_module_dir, "import retrieval; print(retrieval.TOP_K)", cwd=unrelated_cwd)

    assert output == "7"


def test_process_env_var_still_takes_priority_over_env_file(isolated_module_dir):
    (isolated_module_dir / ".env").write_text("RAG_TOP_K=5\n", encoding="utf-8")

    output = run_probe(
        isolated_module_dir, "import retrieval; print(retrieval.TOP_K)", extra_env={"RAG_TOP_K": "3"}
    )

    assert output == "3"


def test_shared_secret_auth_is_actually_enforced_when_env_file_sets_it(isolated_module_dir):
    (isolated_module_dir / ".env").write_text(
        "RAG_X_API_KEY=super-secret\nRAG_X_CLIENT_ID=client-1\n", encoding="utf-8"
    )

    output = run_probe(
        isolated_module_dir,
        "import retrieval\n"
        "try:\n"
        "    retrieval.verify_auth(None, None)\n"
        "    print('NOT_ENFORCED')\n"
        "except Exception as e:\n"
        "    print(f'ENFORCED:{getattr(e, \"status_code\", \"?\")}')",
    )

    assert output == "ENFORCED:401"


def test_shared_secret_auth_rejects_wrong_credentials_from_env_file(isolated_module_dir):
    (isolated_module_dir / ".env").write_text(
        "RAG_X_API_KEY=super-secret\nRAG_X_CLIENT_ID=client-1\n", encoding="utf-8"
    )

    output = run_probe(
        isolated_module_dir,
        "import retrieval\n"
        "try:\n"
        "    retrieval.verify_auth('wrong-key', 'client-1')\n"
        "    print('NOT_ENFORCED')\n"
        "except Exception as e:\n"
        "    print(f'ENFORCED:{getattr(e, \"status_code\", \"?\")}')",
    )

    assert output == "ENFORCED:401"


def test_shared_secret_auth_accepts_correct_credentials_from_env_file(isolated_module_dir):
    (isolated_module_dir / ".env").write_text(
        "RAG_X_API_KEY=super-secret\nRAG_X_CLIENT_ID=client-1\n", encoding="utf-8"
    )

    output = run_probe(
        isolated_module_dir,
        "import retrieval\n"
        "retrieval.verify_auth('super-secret', 'client-1')\n"
        "print('OK')",
    )

    assert output == "OK"
