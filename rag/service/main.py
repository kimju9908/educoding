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
from elasticsearch import Elasticsearch
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

import learning_graph
import agent_graph
import github_graph
import hint_graph
import review_graph
import solution_summary_graph
# Importing retrieval is what actually loads rag/service/.env (see its module
# docstring/top) -- that has to happen before ES_HOST etc. below are read, which is
# exactly why it's a plain import and not deferred.
from retrieval import (
    ALLOWED_LANGUAGES,
    CLAUDE_MODEL,
    ES_HOST,
    ES_PASSWORD,
    ES_USERNAME,
    MAX_TOOL_ITERATIONS,
    ChatTurn,
    chunk_key,
    state,
    verify_auth,
)

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
    # The chunk's own id (same string used as SEARCH_TOOL's chunk_id and as the ES
    # document id). The backend persists it per source, in order, against the
    # assistant message that cited it -- that's what lets a later turn's
    # ChatTurn.sources carry {citationNumber, chunkId} pairs back in as history,
    # so a follow-up that points at an old citation can be looked up for real
    # instead of guessed. See retrieval.CitedSource / agent_graph._render_assistant_turn.
    chunkId: str
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
            chunkId=chunk_key(hit),
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


class ReviewRequest(BaseModel):
    # Built by the backend (CodeReviewService) AFTER it verified ownership and
    # passed=true -- this service doesn't re-check either, it can't (no user context).
    submission: review_graph.SubmissionContext
    challenge: review_graph.ChallengeContext


@app.post("/review/generate", response_model=review_graph.ReviewResult)
def generate_review(
    body: ReviewRequest,
    x_api_key: Optional[str] = Header(default=None),
    x_client_id: Optional[str] = Header(default=None),
    x_anthropic_api_key: Optional[str] = Header(default=None, alias="X-Anthropic-Api-Key"),
):
    verify_auth(x_api_key, x_client_id)

    if not x_anthropic_api_key:
        raise HTTPException(
            status_code=503,
            detail="X-Anthropic-Api-Key header missing -- set ANTHROPIC_API_KEY in backend/.env and restart the backend",
        )

    try:
        return review_graph.run_review(body.submission, body.challenge, x_anthropic_api_key, CLAUDE_MODEL)
    except review_graph.ReviewFormatError as e:
        raise HTTPException(status_code=502, detail=f"AI review format error: {e}")
    except anthropic.AuthenticationError:
        raise HTTPException(status_code=502, detail="Claude API authentication failed -- check ANTHROPIC_API_KEY")
    except anthropic.RateLimitError:
        raise HTTPException(status_code=502, detail="Claude API rate limited, try again shortly")
    except anthropic.APITimeoutError:
        raise HTTPException(status_code=504, detail="Claude API timed out")
    except anthropic.APIStatusError as e:
        raise HTTPException(status_code=502, detail=f"Claude API error: {e.message}")
    except anthropic.APIConnectionError:
        raise HTTPException(status_code=502, detail="Could not reach Claude API")


@app.post("/hint/generate", response_model=hint_graph.HintResult)
def generate_hint(
    body: hint_graph.HintRequestContext,
    x_api_key: Optional[str] = Header(default=None),
    x_client_id: Optional[str] = Header(default=None),
    x_anthropic_api_key: Optional[str] = Header(default=None, alias="X-Anthropic-Api-Key"),
):
    # Built by the backend (CodeHintService) AFTER it verified ownership, challenge match
    # and which level may be revealed -- this service can't re-check any of it (no user context).
    verify_auth(x_api_key, x_client_id)

    if not x_anthropic_api_key:
        raise HTTPException(
            status_code=503,
            detail="X-Anthropic-Api-Key header missing -- set ANTHROPIC_API_KEY in backend/.env and restart the backend",
        )

    try:
        return hint_graph.run_hint(body, x_anthropic_api_key, CLAUDE_MODEL)
    except hint_graph.HintFormatError as e:
        raise HTTPException(status_code=502, detail=f"AI hint format error: {e}")
    except anthropic.AuthenticationError:
        raise HTTPException(status_code=502, detail="Claude API authentication failed -- check ANTHROPIC_API_KEY")
    except anthropic.RateLimitError:
        raise HTTPException(status_code=502, detail="Claude API rate limited, try again shortly")
    except anthropic.APITimeoutError:
        raise HTTPException(status_code=504, detail="Claude API timed out")
    except anthropic.APIStatusError as e:
        raise HTTPException(status_code=502, detail=f"Claude API error: {e.message}")
    except anthropic.APIConnectionError:
        raise HTTPException(status_code=502, detail="Could not reach Claude API")


@app.get("/health")
def health():
    return {"status": "ok"}


# The authenticated Spring backend supplies a closed, user-scoped snapshot.


@app.post("/learning-path/generate", response_model=learning_graph.Selection)
def generate_learning_path(
    body: learning_graph.LearningContext,
    x_api_key: Optional[str] = Header(default=None),
    x_client_id: Optional[str] = Header(default=None),
    x_anthropic_api_key: Optional[str] = Header(default=None, alias="X-Anthropic-Api-Key"),
):
    verify_auth(x_api_key, x_client_id)
    if not x_anthropic_api_key:
        raise HTTPException(status_code=503, detail="AI key missing")
    try:
        return learning_graph.run_learning_path(body, x_anthropic_api_key, CLAUDE_MODEL)
    except anthropic.APITimeoutError:
        raise HTTPException(status_code=504, detail="AI timed out")
    except (ValueError, anthropic.APIError):
        raise HTTPException(status_code=502, detail="AI learning path unavailable or invalid")


# Spring has already verified the GitHub identity, the installation and the selected
# repos, and pins each repo to a HEAD SHA before calling here. The installation token
# is minted fresh per analysis and never stored -- same "secret only in a header, never
# in a model message or the request body" rule as X-Anthropic-Api-Key.
@app.post("/github/diagnose", response_model=github_graph.DiagnosisResult)
async def diagnose_github(
    body: github_graph.DiagnosisContext,
    x_api_key: Optional[str] = Header(default=None),
    x_client_id: Optional[str] = Header(default=None),
    x_anthropic_api_key: Optional[str] = Header(default=None, alias="X-Anthropic-Api-Key"),
    x_github_installation_token: Optional[str] = Header(default=None, alias="X-Github-Installation-Token"),
):
    verify_auth(x_api_key, x_client_id)
    if not x_anthropic_api_key:
        raise HTTPException(status_code=503, detail="AI key missing")
    if not x_github_installation_token:
        raise HTTPException(status_code=503, detail="GitHub installation token missing")
    try:
        return await github_graph.run_diagnosis(body, x_github_installation_token, x_anthropic_api_key, CLAUDE_MODEL)
    except github_graph.DiagnosisFormatError as e:
        raise HTTPException(status_code=502, detail=f"AI diagnosis format error: {e}")
    except anthropic.APITimeoutError:
        raise HTTPException(status_code=504, detail="AI timed out")
    except (ValueError, anthropic.APIError):
        raise HTTPException(status_code=502, detail="AI diagnosis unavailable or invalid")


# No tool-use loop, no MCP -- the backend already assembled everything this needs
# (docs/github-auto-commit.md section 5). AutoCommitJobRunner tries this at most once
# per job attempt and falls back to a fixed default description on any failure.
@app.post("/solution-summary/generate", response_model=solution_summary_graph.SummaryResult)
def generate_solution_summary(
    body: solution_summary_graph.SummaryRequest,
    x_api_key: Optional[str] = Header(default=None),
    x_client_id: Optional[str] = Header(default=None),
    x_anthropic_api_key: Optional[str] = Header(default=None, alias="X-Anthropic-Api-Key"),
):
    verify_auth(x_api_key, x_client_id)
    if not x_anthropic_api_key:
        raise HTTPException(status_code=503, detail="AI key missing")
    try:
        return solution_summary_graph.run_summary(body, x_anthropic_api_key, CLAUDE_MODEL)
    except solution_summary_graph.SummaryFormatError as e:
        raise HTTPException(status_code=502, detail=f"AI summary format error: {e}")
    except anthropic.APITimeoutError:
        raise HTTPException(status_code=504, detail="AI timed out")
    except (ValueError, anthropic.APIError):
        raise HTTPException(status_code=502, detail="AI summary unavailable or invalid")
