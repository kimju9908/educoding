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
import logging
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

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("rag.chatbot")

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

# How many history turns (from the caller) to actually forward to Claude. The backend
# already caps what it sends (RagChatbotService.HISTORY_TURN_LIMIT), this is a second,
# independent cap so a misbehaving/compromised caller can't blow up the prompt size.
MAX_HISTORY_TURNS = int(os.environ.get("RAG_MAX_HISTORY_TURNS", "6"))
VALID_CHAT_ROLES = {"user", "assistant"}

# Hard cap on the tool-use loop below. A model that keeps calling search_study_material
# instead of answering would otherwise burn tokens/latency forever -- the last iteration
# forces a final answer (tool_choice="none") instead of just giving up, so a run that
# hits the cap still returns something grounded in whatever was found so far.
MAX_TOOL_ITERATIONS = int(os.environ.get("RAG_MAX_TOOL_ITERATIONS", "4"))

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


class ChatTurn(BaseModel):
    role: str
    content: str


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


SEARCH_TOOL = {
    "name": "search_study_material",
    "description": (
        "educoding 학습 자료에서 질문과 관련된 내용을 kNN 검색한다. 답변하기 전에 반드시 한 번 "
        "이상 호출해서 근거 자료를 확보해야 하며, 학습 자료에 없는 내용을 추측해서 답하면 안 된다. "
        "사용자의 질문이 대화 맥락에 의존하는 짧은 후속 질문(예: '그거 말고 람다식으로는요?')이라면 "
        "그대로 검색하지 말고, 이전 대화를 참고해 구체적인 검색어로 다시 써서 호출하라. 첫 검색 "
        "결과가 질문에 답하기 부족하면 다른 검색어로 다시 호출할 수 있다. 관련 자료가 전혀 없으면 "
        "결과가 비어 있다는 안내가 돌아오니, 그 경우 추측하지 말고 자료를 찾지 못했다고 답하라."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "검색어. 사용자의 원래 문장이 아니라, 대화 맥락을 반영해 구체화한 질문.",
            },
            "language": {
                "type": "string",
                "enum": sorted(ALLOWED_LANGUAGES),
                "description": "특정 언어로 검색 범위를 제한하고 싶을 때만 지정한다.",
            },
        },
        "required": ["query"],
    },
}


def build_system_prompt() -> str:
    return (
        "너는 educoding 학습 플랫폼의 학습 보조 챗봇이다. search_study_material 도구로 찾은 "
        "학습 자료에 제공된 내용만 근거로 한국어로 답변하라. 학습 자료에 없는 내용은 추측하지 말고, "
        "자료에서 답을 찾을 수 없다고 명확히 말하라. 답변 본문에서 근거로 사용한 자료는 도구 결과에 "
        "표시된 번호를 그대로 [1], [2]처럼 인용하라."
    )


def chunk_key(hit) -> str:
    return hit["_source"].get("id") or hit["_id"]


def format_search_result(hits, cited: dict) -> str:
    """Formats retrieved chunks as a tool_result, assigning each a citation number
    that stays stable across every search call in this request (so Claude citing
    [2] always means the same chunk, even after a second, different-query search).
    `cited` is mutated: chunk id -> (citation number, hit).
    """
    if not hits:
        return "검색 결과 없음 -- 이 검색어로는 관련 학습 자료를 찾지 못했습니다."

    blocks = []
    for hit in hits:
        key = chunk_key(hit)
        if key not in cited:
            cited[key] = (len(cited) + 1, hit)
        number, _ = cited[key]
        src = hit["_source"]
        blocks.append(
            f"[{number}] ({src['language']} / {src['chapterTitle']} / {src['lessonLabel']} / {src['heading']})\n"
            f"{src['content']}"
        )
    return "\n\n".join(blocks)


def resolve_tool_language(tool_input: dict, fallback: Optional[str]) -> Optional[str]:
    value = tool_input.get("language")
    if value in ALLOWED_LANGUAGES:
        return value
    return fallback  # ignore malformed/unsupported values from the model rather than 400ing the whole turn


def run_agent(claude: anthropic.Anthropic, question: str, language: Optional[str], history: List[ChatTurn]):
    """Agentic RAG loop: Claude decides when and what to search (search_study_material),
    can re-search with a rewritten query, and we force a final answer on the last
    iteration so a model that keeps calling tools can't loop forever.
    """
    messages = [
        {"role": turn.role, "content": turn.content}
        for turn in history[-MAX_HISTORY_TURNS:]
        if turn.role in VALID_CHAT_ROLES
    ]
    messages.append({"role": "user", "content": question})

    cited: dict = {}  # chunk id -> (citation number, hit), stable across all searches this request

    for i in range(MAX_TOOL_ITERATIONS):
        is_first = i == 0
        is_last = i == MAX_TOOL_ITERATIONS - 1
        kwargs = dict(
            model=CLAUDE_MODEL,
            max_tokens=2000,
            thinking={"type": "adaptive"},
            system=build_system_prompt(),
            tools=[SEARCH_TOOL],
            messages=messages,
        )
        if is_last:
            kwargs["tool_choice"] = {"type": "none"}  # out of iterations: answer with whatever we have
        elif is_first:
            # Relying on the system prompt's "search before answering" instruction alone
            # isn't reliable -- live-testing a follow-up question found Claude sometimes
            # skips the tool and answers from the conversation history instead, citing a
            # stale [n] number with no sources attached. Forcing the tool on turn 1 makes
            # every answer grounded in an actual search, every time.
            kwargs["tool_choice"] = {"type": "tool", "name": SEARCH_TOOL["name"]}
        response = claude.messages.create(**kwargs)

        messages.append({"role": "assistant", "content": response.content})
        tool_uses = [block for block in response.content if block.type == "tool_use"]

        if not tool_uses:
            answer = next((block.text for block in response.content if block.type == "text"), "")
            ordered_hits = [hit for _, hit in sorted(cited.values(), key=lambda pair: pair[0])]
            logger.info(
                "run_agent finished after %d call(s), %d distinct cited chunk(s), stop_reason=%s",
                i + 1, len(cited), response.stop_reason,
            )
            return answer, ordered_hits

        tool_results = []
        for tool_use in tool_uses:
            query = (tool_use.input or {}).get("query") or question
            tool_language = resolve_tool_language(tool_use.input or {}, language)
            hits = retrieve(query, tool_language)
            tool_results.append({
                "type": "tool_result",
                "tool_use_id": tool_use.id,
                "content": format_search_result(hits, cited),
            })
        messages.append({"role": "user", "content": tool_results})

    # Unreachable in practice: the forced tool_choice="none" call above always returns
    # text, never another tool_use, so the loop always returns inside the `if not
    # tool_uses` branch by the last iteration.
    ordered_hits = [hit for _, hit in sorted(cited.values(), key=lambda pair: pair[0])]
    return "죄송합니다, 지금은 답변을 만들지 못했습니다. 다시 질문해 주세요.", ordered_hits


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
        claude = anthropic.Anthropic(api_key=x_anthropic_api_key)
        answer, hits = run_agent(claude, question, body.language, body.history)
    except anthropic.AuthenticationError:
        raise HTTPException(status_code=502, detail="Claude API authentication failed -- check ANTHROPIC_API_KEY")
    except anthropic.RateLimitError:
        raise HTTPException(status_code=502, detail="Claude API rate limited, try again shortly")
    except anthropic.APIStatusError as e:
        raise HTTPException(status_code=502, detail=f"Claude API error: {e.message}")
    except anthropic.APIConnectionError:
        raise HTTPException(status_code=502, detail="Could not reach Claude API")

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
