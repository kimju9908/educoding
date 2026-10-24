"""Golden-set retrieval eval for the RAG chatbot service.

Runs each case in golden_set.jsonl against the *real* Elasticsearch index and
BGE-m3 model (no mocks -- see rag/service/test_main.py for the mocked unit
tests) and checks whether the chunk we expect shows up in the top-K results.

This is how retrieval regressions and failure cases get reproduced: when a
question returns the wrong lesson (or nothing), add it here with the chunk id
it *should* have hit, then re-run after a fix to confirm it's actually fixed
rather than just no-longer-broken by luck.

Requires Elasticsearch to be up and `study_chunks` indexed (see rag/README.md).
Does not call Claude -- it only checks retrieval, so it needs no API key.

Run:
    cd rag
    source .venv/bin/activate
    python eval/run_eval.py
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "service"))
import main  # noqa: E402

GOLDEN_SET_PATH = Path(__file__).parent / "golden_set.jsonl"


def load_cases():
    with open(GOLDEN_SET_PATH, encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


def run():
    from elasticsearch import Elasticsearch
    from sentence_transformers import SentenceTransformer

    print(f"Loading {main.CLAUDE_MODEL and 'BGE-m3'} embedding model...")
    main.state["model"] = SentenceTransformer("BAAI/bge-m3")
    main.state["es"] = Elasticsearch(main.ES_HOST)

    cases = load_cases()
    failures = []

    for case in cases:
        hits = main.retrieve(case["question"], case.get("language"))
        hit_ids = [h["_source"].get("id") or h["_id"] for h in hits]
        top_score = hits[0]["_score"] if hits else 0.0

        ok = True
        reason = ""

        expect_id = case.get("expect_chunk_id")
        if expect_id and expect_id not in hit_ids:
            ok = False
            reason = f"expected chunk '{expect_id}' not in top-{len(hits)}: {hit_ids}"

        if case.get("expect_low_score") and top_score > 0.55:
            ok = False
            reason = f"expected a low top score (off-topic question) but got {top_score:.3f} ({hit_ids[:1]})"

        status = "PASS" if ok else "FAIL"
        print(f"[{status}] {case['id']}: {case['question']!r}")
        if not ok:
            print(f"         {reason}")
        elif case.get("note"):
            print(f"         note: {case['note']} (top score={top_score:.3f}, hits={hit_ids})")

        if not ok:
            failures.append(case["id"])

    print(f"\n{len(cases) - len(failures)}/{len(cases)} passed.")
    if failures:
        print(f"Failed: {', '.join(failures)}")
        sys.exit(1)


if __name__ == "__main__":
    run()
