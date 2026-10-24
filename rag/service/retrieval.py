"""Retrieval + tool-schema layer shared by main.py (FastAPI transport) and
agent_graph.py (the LangGraph agent). Framework-agnostic on purpose: nothing
here imports FastAPI or LangGraph/LangChain, so it's also what rag/service/
test_main.py and rag/eval/run_eval.py exercise directly.
"""
import os
from typing import List, Optional

from fastapi import HTTPException
from pydantic import BaseModel

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

# Hard cap on the search_study_material tool-use loop. A model that keeps calling the
# tool instead of answering would otherwise burn tokens/latency forever -- the last
# iteration forces a final answer (tool_choice="none") instead of just giving up, so a
# run that hits the cap still returns something grounded in whatever was found so far.
MAX_TOOL_ITERATIONS = int(os.environ.get("RAG_MAX_TOOL_ITERATIONS", "4"))

ALLOWED_LANGUAGES = {"java", "c", "cplus", "javascript", "python"}

state: dict = {}


class ChatTurn(BaseModel):
    role: str
    content: str


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
    """Formats retrieved chunks as a tool result, assigning each a citation number
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


def ordered_hits_from_cited(cited: dict) -> List[dict]:
    return [hit for _, hit in sorted(cited.values(), key=lambda pair: pair[0])]
