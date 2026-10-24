#!/usr/bin/env python3
"""Embed the lesson chunks produced by rag/chunking/chunk_lessons.py using
BAAI/bge-m3, and write each chunk back out with its embedding vector attached.

Run from the rag/ venv:
    source .venv/bin/activate
    python embedding/embed_chunks.py
"""
import json
from pathlib import Path

from sentence_transformers import SentenceTransformer
import torch

RAG_DIR = Path(__file__).resolve().parent.parent
INPUT_PATH = RAG_DIR / "data" / "chunks.jsonl"
OUTPUT_PATH = RAG_DIR / "data" / "chunks_with_embeddings.jsonl"
MODEL_NAME = "BAAI/bge-m3"
BATCH_SIZE = 32


def pick_device():
    if torch.backends.mps.is_available():
        return "mps"
    if torch.cuda.is_available():
        return "cuda"
    return "cpu"


def main():
    records = [json.loads(line) for line in INPUT_PATH.open(encoding="utf-8")]
    print(f"Loaded {len(records)} chunks from {INPUT_PATH}")

    device = pick_device()
    print(f"Loading {MODEL_NAME} on device={device} ...")
    model = SentenceTransformer(MODEL_NAME, device=device)

    # BGE-m3 needs no query/passage instruction prefix (unlike E5 models) --
    # per the model card, just embed the raw text.
    texts = [f"{r['heading']}\n\n{r['content']}" for r in records]

    embeddings = model.encode(
        texts,
        batch_size=BATCH_SIZE,
        normalize_embeddings=True,
        show_progress_bar=True,
    )

    with OUTPUT_PATH.open("w", encoding="utf-8") as f:
        for record, vector in zip(records, embeddings):
            record["embedding"] = vector.tolist()
            f.write(json.dumps(record, ensure_ascii=False) + "\n")

    print(f"Wrote {len(records)} embedded chunks to {OUTPUT_PATH}")
    print(f"Embedding dimension: {len(embeddings[0])}")


if __name__ == "__main__":
    main()
