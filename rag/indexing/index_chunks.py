#!/usr/bin/env python3
"""Create (or recreate) the `study_chunks` Elasticsearch index and bulk-index
the embedded lesson chunks produced by rag/embedding/embed_chunks.py.

Run from the rag/ venv:
    source .venv/bin/activate
    pip install -r indexing/requirements.txt
    python indexing/index_chunks.py
"""
import json
import os
from pathlib import Path

from elasticsearch import Elasticsearch, helpers

RAG_DIR = Path(__file__).resolve().parent.parent
INPUT_PATH = RAG_DIR / "data" / "chunks_with_embeddings.jsonl"
INDEX_NAME = "study_chunks"
EMBEDDING_DIMS = 1024

ES_HOST = os.environ.get("ELASTIC_END_POINT", "http://127.0.0.1:9200")
ES_USERNAME = os.environ.get("ELASTIC_USERNAME") or None
ES_PASSWORD = os.environ.get("ELASTIC_PASSWORD") or None

INDEX_MAPPING = {
    "mappings": {
        "properties": {
            "language": {"type": "keyword"},
            "chapterKey": {"type": "keyword"},
            "chapterTitle": {"type": "text"},
            "lessonKey": {"type": "keyword"},
            "lessonLabel": {"type": "text"},
            "chunkIndex": {"type": "integer"},
            "headingIndex": {"type": "integer"},
            "heading": {"type": "text"},
            "content": {"type": "text"},
            "charCount": {"type": "integer"},
            "embedding": {
                "type": "dense_vector",
                "dims": EMBEDDING_DIMS,
                "index": True,
                "similarity": "cosine",
            },
        }
    }
}


def build_client():
    kwargs = {}
    if ES_USERNAME and ES_PASSWORD:
        kwargs["basic_auth"] = (ES_USERNAME, ES_PASSWORD)
    return Elasticsearch(ES_HOST, **kwargs)


def main():
    if not INPUT_PATH.exists():
        raise SystemExit(f"{INPUT_PATH} not found -- run embed_chunks.py first")

    es = build_client()
    if not es.ping():
        raise SystemExit(f"Could not reach Elasticsearch at {ES_HOST}")

    if es.indices.exists(index=INDEX_NAME):
        print(f"Deleting existing index '{INDEX_NAME}'")
        es.indices.delete(index=INDEX_NAME)

    print(f"Creating index '{INDEX_NAME}'")
    es.indices.create(index=INDEX_NAME, body=INDEX_MAPPING)

    def actions():
        with INPUT_PATH.open(encoding="utf-8") as f:
            for line in f:
                record = json.loads(line)
                yield {
                    "_index": INDEX_NAME,
                    "_id": record["id"],
                    "_source": record,
                }

    success, errors = helpers.bulk(es, actions(), raise_on_error=False)
    print(f"Indexed {success} documents")
    if errors:
        print(f"{len(errors)} errors (showing first 3):")
        for err in errors[:3]:
            print(err)

    es.indices.refresh(index=INDEX_NAME)
    count = es.count(index=INDEX_NAME)["count"]
    print(f"Document count in '{INDEX_NAME}': {count}")


if __name__ == "__main__":
    main()
