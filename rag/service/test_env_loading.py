"""Regression tests for the .env-loading-order bug: main.py used to import
retrieval.py (whose module-level constants like TOP_K/RAG_X_API_KEY are read
from os.environ at *import time*) before calling load_dotenv(), so .env's
values never actually took effect -- TOP_K silently kept its hardcoded
default, and RAG_X_API_KEY/RAG_X_CLIENT_ID stayed None, which disables the
shared-secret auth check entirely (verify_auth(None, None) just returns).

These have to run retrieval.py fresh in a *subprocess* rather than import it
in-process: pytest (or any earlier test file) may have already imported it,
and Python caches imports, so a second `import retrieval` here wouldn't
re-run its module-level code at all and would silently pass regardless of
whether the bug is actually fixed. Each subprocess also gets a deliberately
minimal environment (just PATH) so a variable already exported in the
developer's own shell can't mask the bug either.

Mutates and restores the real rag/service/.env (via a backup) rather than
pointing retrieval.py at an arbitrary path, since the fix is specifically
that retrieval.py loads *its own* directory's .env -- these tests exercise
that exact path, not a parameterized one. No real secrets are read or
written: the temporary content is synthetic.
"""
import os
import subprocess
import sys
from pathlib import Path

import pytest

SERVICE_DIR = Path(__file__).resolve().parent
ENV_PATH = SERVICE_DIR / ".env"


def run_probe(code: str, extra_env: dict | None = None, cwd: Path | None = None) -> str:
    env = {"PATH": os.environ.get("PATH", "")}
    if extra_env:
        env.update(extra_env)
    result = subprocess.run(
        [sys.executable, "-c", f"import sys; sys.path.insert(0, {str(SERVICE_DIR)!r}); {code}"],
        cwd=str(cwd or SERVICE_DIR.parent.parent),  # default: repo root, to prove cwd independence
        env=env,
        capture_output=True,
        text=True,
        timeout=60,
    )
    assert result.returncode == 0, f"probe failed:\nstdout={result.stdout}\nstderr={result.stderr}"
    return result.stdout.strip()


@pytest.fixture
def temp_env_file():
    original = ENV_PATH.read_text(encoding="utf-8") if ENV_PATH.exists() else None

    def write(content: str):
        ENV_PATH.write_text(content, encoding="utf-8")

    try:
        yield write
    finally:
        if original is not None:
            ENV_PATH.write_text(original, encoding="utf-8")
        elif ENV_PATH.exists():
            ENV_PATH.unlink()


def test_env_file_value_overrides_hardcoded_default(temp_env_file):
    temp_env_file("RAG_TOP_K=9\n")

    output = run_probe("import retrieval; print(retrieval.TOP_K)")

    assert output == "9"


def test_env_file_value_is_read_regardless_of_launch_directory(temp_env_file, tmp_path):
    temp_env_file("RAG_TOP_K=7\n")

    # Launched from an unrelated directory, nowhere near rag/service/ -- if retrieval.py
    # ever went back to relying on load_dotenv()'s default upward-search-from-cwd
    # behavior, this would silently fall back to the hardcoded default instead.
    output = run_probe("import retrieval; print(retrieval.TOP_K)", cwd=tmp_path)

    assert output == "7"


def test_process_env_var_still_takes_priority_over_env_file(temp_env_file):
    temp_env_file("RAG_TOP_K=5\n")

    output = run_probe("import retrieval; print(retrieval.TOP_K)", extra_env={"RAG_TOP_K": "3"})

    assert output == "3"


def test_shared_secret_auth_is_actually_enforced_when_env_file_sets_it(temp_env_file):
    temp_env_file("RAG_X_API_KEY=super-secret\nRAG_X_CLIENT_ID=client-1\n")

    output = run_probe(
        "import retrieval\n"
        "try:\n"
        "    retrieval.verify_auth(None, None)\n"
        "    print('NOT_ENFORCED')\n"
        "except Exception as e:\n"
        "    print(f'ENFORCED:{getattr(e, \"status_code\", \"?\")}')"
    )

    assert output == "ENFORCED:401"


def test_shared_secret_auth_accepts_correct_credentials_from_env_file(temp_env_file):
    temp_env_file("RAG_X_API_KEY=super-secret\nRAG_X_CLIENT_ID=client-1\n")

    output = run_probe(
        "import retrieval\n"
        "retrieval.verify_auth('super-secret', 'client-1')\n"
        "print('OK')"
    )

    assert output == "OK"
