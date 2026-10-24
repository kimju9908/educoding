#!/usr/bin/env python3
"""Chunk educoding study-seed lesson content for RAG embedding.

Reads backend/src/main/resources/study-seed/*.json (language -> chapters -> lessons,
each lesson holding a markdown `content` string) and emits one JSON object per
chunk to rag/data/chunks.jsonl, ready to be embedded and indexed.

Splitting is markdown-header aware (##, ###, ####) and never breaks inside a
fenced code block (``` ... ```), since code examples would lose meaning if
cut in half. Sections above MAX_CHARS are split by a deeper header level (or,
as a last resort, by blank-line paragraph breaks); adjacent small sections are
merged back together up to MAX_CHARS so chunks stay close to the target size.
"""
import json
import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
STUDY_SEED_DIR = REPO_ROOT / "backend" / "src" / "main" / "resources" / "study-seed"
OUTPUT_PATH = Path(__file__).resolve().parent.parent / "data" / "chunks.jsonl"

MAX_CHARS = 1200
MIN_CHARS = 200
FENCE_RE = re.compile(r"^\s*```")


def split_on_fence_aware_boundaries(lines, is_boundary):
    """Split `lines` into segments at indices where is_boundary(line) is True,
    skipping any boundary found inside a ``` fenced code block."""
    segments, current = [], []
    in_fence = False
    for line in lines:
        if FENCE_RE.match(line):
            in_fence = not in_fence
        if not in_fence and is_boundary(line) and current:
            segments.append(current)
            current = [line]
        else:
            current.append(line)
    if current:
        segments.append(current)
    return segments


def header_boundary(level):
    prefix = "#" * level
    pattern = re.compile(rf"^{prefix}\s+\S")
    not_deeper = re.compile(rf"^{prefix}#")

    def is_boundary(line):
        return bool(pattern.match(line)) and not not_deeper.match(line)

    return is_boundary


def header_text(line):
    return line.lstrip("#").strip()


def split_paragraphs_fence_aware(lines):
    return split_on_fence_aware_boundaries(
        lines, lambda line: line.strip() == ""
    )


def chunk_text(text, heading_trail, level=2):
    """Recursively split `text` into chunks <= MAX_CHARS, carrying a heading
    breadcrumb (heading_trail) for context. Returns list of (heading, chunk_text)."""
    if len(text) <= MAX_CHARS or level > 4:
        if len(text) <= MAX_CHARS:
            return [(heading_trail, text.strip())]
        return split_by_paragraphs(text, heading_trail)

    lines = text.split("\n")
    segments = split_on_fence_aware_boundaries(lines, header_boundary(level))

    if len(segments) <= 1:
        return chunk_text(text, heading_trail, level=level + 1)

    chunks = []
    for seg in segments:
        seg_text = "\n".join(seg)
        first_line = seg[0]
        sub_heading = heading_trail
        if header_boundary(level)(first_line):
            sub_heading = f"{heading_trail} > {header_text(first_line)}" if heading_trail else header_text(first_line)
        if len(seg_text) <= MAX_CHARS:
            chunks.append((sub_heading, seg_text.strip()))
        else:
            chunks.extend(chunk_text(seg_text, sub_heading, level=level + 1))
    return merge_small_chunks(chunks)


def split_by_paragraphs(text, heading_trail):
    lines = text.split("\n")
    segments = split_paragraphs_fence_aware(lines)
    chunks = [("\n".join(seg)).strip() for seg in segments if "".join(seg).strip()]
    merged, current = [], ""
    for part in chunks:
        candidate = f"{current}\n\n{part}" if current else part
        if len(candidate) <= MAX_CHARS or not current:
            current = candidate
        else:
            merged.append(current)
            current = part
    if current:
        merged.append(current)
    return [(heading_trail, c) for c in merged]


def merge_small_chunks(chunks):
    """Greedily merge adjacent chunks sharing a heading trail up to MAX_CHARS,
    so short trailing sections (e.g. a 2-line summary) don't become their own chunk."""
    merged = []
    for heading, text in chunks:
        if (
            merged
            and merged[-1][0] == heading
            and len(merged[-1][1]) + len(text) + 2 <= MAX_CHARS
            and len(merged[-1][1]) < MIN_CHARS
        ):
            prev_heading, prev_text = merged.pop()
            merged.append((prev_heading, f"{prev_text}\n\n{text}"))
        else:
            merged.append((heading, text))
    return merged


ANY_HEADER_RE = re.compile(r"^#{1,6}\s+\S")


def heading_lines_in_order(content):
    """All markdown heading lines in `content`, in document order, skipping
    anything inside a fenced code block. Used to assign each chunk a stable
    `headingIndex` -- the position (0-based) of the heading it falls under,
    among ALL headings react-markdown will render for this lesson. The
    frontend attaches the same index to each rendered heading element, so a
    chunk's headingIndex is a reliable deep-link target (see Study_Class.tsx)."""
    headings, in_fence = [], False
    for line in content.split("\n"):
        if FENCE_RE.match(line):
            in_fence = not in_fence
            continue
        if not in_fence and ANY_HEADER_RE.match(line):
            headings.append(line.strip())
    return headings


def assign_heading_indices(pieces, content):
    """Walk `pieces` in order, matching each piece's leading heading line
    (if any) against the lesson's full heading sequence to get a 0-based
    headingIndex. A piece with no leading heading (e.g. intro text before
    the first heading) inherits the previous piece's index."""
    order = heading_lines_in_order(content)
    cursor = 0
    current_index = 0
    result = []
    for heading, text in pieces:
        first_line = text.split("\n", 1)[0].strip()
        if ANY_HEADER_RE.match(first_line):
            while cursor < len(order) and order[cursor] != first_line:
                cursor += 1
            if cursor < len(order):
                current_index = cursor
                cursor += 1
        result.append((heading, text, current_index))
    return result


HEADER_LINE_RE = re.compile(r"^#+\s")


def is_trivial(text):
    """A chunk with no real body -- just a lone header line and/or a '---'
    divider left over from splitting (e.g. a section whose only content was
    its own heading, or a stray markdown rule)."""
    core_lines = [
        line
        for line in text.split("\n")
        if line.strip() and not HEADER_LINE_RE.match(line) and line.strip() != "---"
    ]
    return len("\n".join(core_lines).strip()) < 15


def finalize_pieces(pieces):
    """Fold trivial (near-empty) chunks into a neighbor so no near-empty
    chunk is embedded on its own."""
    result = []
    pieces = list(pieces)
    i = 0
    while i < len(pieces):
        heading, text = pieces[i]
        if is_trivial(text) and i + 1 < len(pieces):
            next_heading, next_text = pieces[i + 1]
            pieces[i + 1] = (next_heading, f"{text.strip()}\n\n{next_text}")
        elif is_trivial(text) and result:
            prev_heading, prev_text = result.pop()
            result.append((prev_heading, f"{prev_text}\n\n{text.strip()}"))
        else:
            result.append((heading, text))
        i += 1
    return result


def chunk_lesson(language, chapter, lesson):
    content = lesson["content"]
    base_heading = f"{chapter['title']} > {lesson['label']}"
    pieces = finalize_pieces(chunk_text(content, base_heading, level=2))
    pieces = assign_heading_indices(pieces, content)

    records = []
    for idx, (heading, text, heading_index) in enumerate(pieces):
        if not text.strip():
            continue
        records.append(
            {
                "id": f"{language}-{chapter['chapterKey']}-{lesson['lessonKey']}-{idx:02d}",
                "language": language,
                "chapterKey": chapter["chapterKey"],
                "chapterTitle": chapter["title"],
                "lessonKey": lesson["lessonKey"],
                "lessonLabel": lesson["label"],
                "chunkIndex": idx,
                "heading": heading,
                "headingIndex": heading_index,
                "content": text,
                "charCount": len(text),
            }
        )
    return records


def main():
    seed_files = sorted(STUDY_SEED_DIR.glob("*.json"))
    if not seed_files:
        raise SystemExit(f"No study-seed files found under {STUDY_SEED_DIR}")

    all_records = []
    for seed_file in seed_files:
        language = seed_file.stem
        chapters = json.loads(seed_file.read_text(encoding="utf-8"))
        for chapter in chapters:
            for lesson in chapter["lessons"]:
                all_records.extend(chunk_lesson(language, chapter, lesson))

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_PATH.open("w", encoding="utf-8") as f:
        for record in all_records:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")

    sizes = [r["charCount"] for r in all_records]
    print(f"Wrote {len(all_records)} chunks to {OUTPUT_PATH}")
    print(f"charCount: min={min(sizes)} max={max(sizes)} avg={sum(sizes) / len(sizes):.0f}")


if __name__ == "__main__":
    main()
