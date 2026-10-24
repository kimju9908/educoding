"""RAG chatbot service for educoding study content.

Given a question, embeds it with BGE-m3, retrieves the most relevant lesson
chunks from the `study_chunks` Elasticsearch index, and asks Claude to answer
grounded in that retrieved content. Each returned source links straight back
to the originating lesson page and section via `headingIndex` (see
rag/chunking/chunk_lessons.py for how that index is computed, and
frontend Study_Class.tsx for how it's consumed).

This service is called server-to-server by the Spring Boot backend (see
RagChatbotService.java) -- mirrors how the backend already proxies to the
`judge` Flask service. It is never called directly from the browser.

The Anthropic API key is NOT configured here -- the backend owns it
(backend/.env's ANTHROPIC_API_KEY) and sends it on the X-Anthropic-Api-Key
header of every request, so there's one place to manage/rotate it.

Run:
    source ../.venv/bin/activate
    pip install -r requirements.txt
    cp .env.example .env
    uvicorn main:app --host 127.0.0.1 --port 5051
"""
import os
from contextlib import asynccontextmanager
from typing import List, Optional

import anthropic
import torch
from dotenv import load_dotenv
from elasticsearch import Elasticsearch
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

load_dotenv()

ES_HOST = os.environ.get("ELASTIC_END_POINT", "http://127.0.0.1:9200")
ES_USERNAME = os.environ.get("ELASTIC_USERNAME") or None
ES_PASSWORD = os.environ.get("ELASTIC_PASSWORD") or None
INDEX_NAME = "study_chunks"

CLAUDE_MODEL = os.environ.get("CLAUDE_MODEL", "claude-sonnet-5")
TOP_K = int(os.environ.get("RAG_TOP_K", "5"))
# Below this cosine similarity, a hit is treated as noise rather than a real match --
# e.g. "오늘 저녁 메뉴 추천해줘" otherwise pulls in a HashMap "메뉴 예제" chunk at ~0.74
# purely on the word "메뉴". Calibrated against eval/golden_set.jsonl: true matches
# cluster at 0.81-0.89, that off-topic case sits at 0.74. See eval/run_eval.py.
RAG_MIN_SCORE = float(os.environ.get("RAG_MIN_SCORE", "0.75"))

RAG_X_API_KEY = os.environ.get("RAG_X_API_KEY")
RAG_X_CLIENT_ID = os.environ.get("RAG_X_CLIENT_ID")

ALLOWED_LANGUAGES = {"java", "c", "cplus", "javascript", "python"}

state = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    device = "mps" if torch.backends.mps.is_available() else ("cuda" if torch.cuda.is_available() else "cpu")
    state["model"] = SentenceTransformer("BAAI/bge-m3", device=device)

    es_kwargs = {}
    if ES_USERNAME and ES_PASSWORD:
        es_kwargs["basic_auth"] = (ES_USERNAME, ES_PASSWORD)
    state["es"] = Elasticsearch(ES_HOST, **es_kwargs)
    yield
    state.clear()


app = FastAPI(title="educoding RAG chatbot service", lifespan=lifespan)


class AskRequest(BaseModel):
    question: str
    language: Optional[str] = None


class Source(BaseModel):
    language: str
    chapterTitle: str
    lessonLabel: str
    heading: str
    headingIndex: int
    url: str
    score: float


class AskResponse(BaseModel):
    answer: str
    sources: List[Source]


def verify_auth(x_api_key: Optional[str], x_client_id: Optional[str]):
    if not RAG_X_API_KEY:
        return  # auth disabled (e.g. local dev with no key configured)
    if x_api_key != RAG_X_API_KEY or x_client_id != RAG_X_CLIENT_ID:
        raise HTTPException(status_code=401, detail="invalid credentials")


def retrieve(question: str, language: Optional[str]):
    vector = state["model"].encode([question], normalize_embeddings=True)[0].tolist()
    knn = {
        "field": "embedding",
        "query_vector": vector,
        "k": TOP_K,
        "num_candidates": max(50, TOP_K * 10),
    }
    if language:
        knn["filter"] = {"term": {"language": language}}
    response = state["es"].search(index=INDEX_NAME, knn=knn, size=TOP_K)
    return [hit for hit in response["hits"]["hits"] if hit["_score"] >= RAG_MIN_SCORE]


def build_prompt(question: str, hits) -> tuple:
    context_blocks = []
    for i, hit in enumerate(hits, start=1):
        src = hit["_source"]
        context_blocks.append(
            f"[{i}] ({src['language']} / {src['chapterTitle']} / {src['lessonLabel']} / {src['heading']})\n"
            f"{src['content']}"
        )
    context = "\n\n".join(context_blocks)

    system = (
        "너는 educoding 학습 플랫폼의 학습 보조 챗봇이다. "
        "아래 [학습 자료]에 제공된 내용만 근거로 한국어로 답변하라. "
        "학습 자료에 없는 내용은 추측하지 말고, 자료에서 답을 찾을 수 없다고 명확히 말하라. "
        "답변 본문에서 근거로 사용한 자료는 해당 번호를 [1], [2]처럼 표시하라."
    )
    user = f"[학습 자료]\n{context}\n\n[질문]\n{question}"
    return system, user


@app.post("/chatbot/ask", response_model=AskResponse)
def ask(
    body: AskRequest,
    x_api_key: Optional[str] = Header(default=None),
    x_client_id: Optional[str] = Header(default=None),
    x_anthropic_api_key: Optional[str] = Header(default=None, alias="X-Anthropic-Api-Key"),
):
    verify_auth(x_api_key, x_client_id)

    question = body.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="question is required")

    if body.language and body.language not in ALLOWED_LANGUAGES:
        raise HTTPException(status_code=400, detail=f"unsupported language: {body.language}")

    if not x_anthropic_api_key:
        raise HTTPException(
            status_code=503,
            detail="X-Anthropic-Api-Key header missing -- set ANTHROPIC_API_KEY in backend/.env and restart the backend",
        )

    hits = retrieve(question, body.language)
    if not hits:
        return AskResponse(answer="관련된 학습 자료를 찾지 못했습니다.", sources=[])

    system, user = build_prompt(question, hits)

    try:
        claude = anthropic.Anthropic(api_key=x_anthropic_api_key)
        response = claude.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=2000,
            thinking={"type": "adaptive"},
            system=system,
            messages=[{"role": "user", "content": user}],
        )
    except anthropic.AuthenticationError:
        raise HTTPException(status_code=502, detail="Claude API authentication failed -- check ANTHROPIC_API_KEY")
    except anthropic.RateLimitError:
        raise HTTPException(status_code=502, detail="Claude API rate limited, try again shortly")
    except anthropic.APIStatusError as e:
        raise HTTPException(status_code=502, detail=f"Claude API error: {e.message}")
    except anthropic.APIConnectionError:
        raise HTTPException(status_code=502, detail="Could not reach Claude API")

    answer = next((block.text for block in response.content if block.type == "text"), "")

    sources = [
        Source(
            language=hit["_source"]["language"],
            chapterTitle=hit["_source"]["chapterTitle"],
            lessonLabel=hit["_source"]["lessonLabel"],
            heading=hit["_source"]["heading"],
            headingIndex=hit["_source"]["headingIndex"],
            url=(
                f"/study/{hit['_source']['language']}"
                f"/{hit['_source']['chapterKey']}/{hit['_source']['lessonKey']}"
                f"?headingIndex={hit['_source']['headingIndex']}"
            ),
            score=hit["_score"],
        )
        for hit in hits
    ]

    return AskResponse(answer=answer, sources=sources)


@app.get("/health")
def health():
    return {"status": "ok"}
