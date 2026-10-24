"""RAG chatbot service for educoding study content.

Given a question, Claude decides when and what to search via the
search_study_material tool (BGE-m3 embedding + kNN against the `study_chunks`
Elasticsearch index -- see retrieval.py), then answers grounded in whatever it
found. The actual agent loop is a LangGraph graph (agent_graph.py); this file
is just the FastAPI transport layer. Each returned source links straight back
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
import logging
from contextlib import asynccontextmanager
from typing import List, Optional

import anthropic
import torch
from dotenv import load_dotenv
from elasticsearch import Elasticsearch
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

import agent_graph
from retrieval import (
    ALLOWED_LANGUAGES,
    CLAUDE_MODEL,
    ES_HOST,
    ES_PASSWORD,
    ES_USERNAME,
    MAX_TOOL_ITERATIONS,
    ChatTurn,
    state,
    verify_auth,
)

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("rag.chatbot")


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
    history: List[ChatTurn] = []


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

    try:
        answer, hits = agent_graph.run(
            question, body.language, body.history, x_anthropic_api_key, CLAUDE_MODEL, MAX_TOOL_ITERATIONS,
        )
    except anthropic.AuthenticationError:
        raise HTTPException(status_code=502, detail="Claude API authentication failed -- check ANTHROPIC_API_KEY")
    except anthropic.RateLimitError:
        raise HTTPException(status_code=502, detail="Claude API rate limited, try again shortly")
    except anthropic.APIStatusError as e:
        raise HTTPException(status_code=502, detail=f"Claude API error: {e.message}")
    except anthropic.APIConnectionError:
        raise HTTPException(status_code=502, detail="Could not reach Claude API")

    logger.info("answered with %d distinct cited chunk(s)", len(hits))

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
