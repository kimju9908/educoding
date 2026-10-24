# RAG 챗봇 파이프라인

학습 자료(`backend/src/main/resources/study-seed/*.json`)를 임베딩해서 Elasticsearch에
넣고, 질문이 오면 관련 내용을 검색해 Claude로 답변을 생성하는 챗봇 서비스입니다.

```
study-seed/*.json
  -> chunking/chunk_lessons.py   (레슨을 섹션 단위로 쪼개고 headingIndex 부여)
  -> embedding/embed_chunks.py   (BGE-m3로 임베딩)
  -> indexing/index_chunks.py    (Elasticsearch study_chunks 인덱스에 색인)
  -> service/main.py             (질문 임베딩 -> kNN 검색 -> Claude 답변 생성, FastAPI)
  -> backend (Spring Boot)       (/api/chatbot/ask 에서 위 서비스로 프록시)
  -> frontend                    (학습 페이지 우하단 챗봇 위젯, 답변 속 출처 링크로 해당 섹션까지 스크롤)
```

## 처음 설정

```bash
cd rag
python3 -m venv .venv
source .venv/bin/activate
pip install -r embedding/requirements.txt -r indexing/requirements.txt -r service/requirements.txt

python chunking/chunk_lessons.py      # data/chunks.jsonl
python embedding/embed_chunks.py      # data/chunks_with_embeddings.jsonl (M4 Pro는 MPS로 ~40초)

# Elasticsearch가 떠 있어야 함 (local/docker-compose.yml, 또는 docker compose up -d elasticsearch)
python indexing/index_chunks.py       # study_chunks 인덱스 생성 + 색인

cp service/.env.example service/.env  # 이미 .env는 만들어져 있음 -- ANTHROPIC_API_KEY만 채우면 됨
```

`service/.env`에 본인의 Anthropic API 키를 넣어야 답변이 생성됩니다
(https://console.anthropic.com/settings/keys). 나머지 값(ES 주소, 서비스 간 공유 비밀키)은
local 기본값으로 이미 채워져 있습니다.

## 실행

`local/start-all.sh`가 백엔드/프론트와 함께 이 서비스도 자동으로 띄웁니다
(포트 5051). 따로 띄우려면:

```bash
cd rag/service
source ../.venv/bin/activate
uvicorn main:app --host 127.0.0.1 --port 5051
```

## 학습 자료가 바뀌었을 때

`study-seed/*.json`을 수정한 뒤 `chunking` -> `embedding` -> `indexing` 세 스크립트를
순서대로 다시 돌리면 됩니다 (전체 749개 청크 기준 1분 이내).

## 테스트 & 평가

```bash
cd rag/service
source ../.venv/bin/activate
pip install -r requirements-dev.txt
pytest -v                       # ES/모델/Claude를 모두 모킹한 유닛 테스트 (외부 서비스 불필요)
```

```bash
cd rag
python eval/run_eval.py         # 실제 Elasticsearch + BGE-m3로 돌리는 retrieval 골든셋 평가
```

`eval/golden_set.jsonl`은 질문 -> 기대 청크 id 쌍의 회귀 테스트 모음입니다. 질문이 엉뚱한
레슨을 가져오거나 아예 못 찾는 걸 발견하면, 그 질문을 여기 추가하고 원인을 고친 뒤 다시 돌려서
실제로 고쳐졌는지 확인하는 식으로 씁니다. 자세한 내용과 이 과정에서 실제로 잡힌 버그는
[`eval/README.md`](eval/README.md) 참고.

## 대화 상태 (멀티턴)

```
frontend (sessionId 생성, 매 질문마다 같이 전송)
  -> RagChatbotController / RagChatbotService   (sessionId로 DB에서 최근 히스토리 조회)
  -> chat_message 테이블                          (턴마다 USER/ASSISTANT 메시지 저장)
  -> service/main.py                              (history를 Claude messages 배열로 변환)
```

프론트의 챗봇 위젯은 열려 있는 동안 유지되는 `sessionId`(UUID)를 매 질문에 함께 보냅니다.
백엔드(`RagChatbotService`)는 이 값으로 `chat_message` 테이블에서 최근 6턴을 불러와
RAG 서비스에 `history`로 같이 보내고, 이번 턴(질문+답변)을 다시 저장합니다. `/api/chatbot/**`는
비로그인 사용자도 쓸 수 있는 공개 엔드포인트라(`SecurityConfig`), 대화는 User가 아니라
`sessionId`만으로 구분됩니다 -- sessionId를 안 보내면 예전처럼 매 질문이 독립적으로 처리됩니다.

## 도구 호출 (에이전틱 RAG)

예전에는 질문이 오면 백엔드가 먼저 검색하고, 그 결과를 통째로 Claude에게 넘겨서 답변만
받아오는 구조였습니다. 이제는 검색 자체가 `search_study_material` 도구이고, Claude가
"지금 검색이 필요한지, 뭘로 검색할지"를 직접 판단합니다 (`run_agent`, `service/main.py`).

```
질문 -> Claude (도구 보유)
          ├─ tool_use: search_study_material(query, language?)
          │     -> retrieve() 실행 -> 결과를 [번호] 붙여서 tool_result로 반환
          │     -> Claude가 다시 판단: 답변 가능하면 답변, 부족하면 다른 검색어로 재검색
          └─ (반복 상한 도달 시) 마지막 호출은 tool_choice="none"으로 강제 답변
```

이 구조가 멀티턴에서 특히 중요한 이유: 검색어가 이번 질문 그대로가 아니라 Claude가 대화
맥락을 반영해 다시 쓴 문장이라는 점입니다. "그럼 반환값이 없을 때는요?" 같은 후속 질문을
그대로 임베딩하면 검색이 빗나가지만, Claude가 이를 "자바 메소드 void 반환형 선언 방법"처럼
구체화해서 검색하면 제대로 맞습니다 -- 멀티턴 단계에서 문서화했던 검색 한계가 이 단계에서
실제로 해결됐습니다.

### 실제로 잡은 도구 호출 실패 사례

도구 호출을 실제 운영 중인 로컬 스택에 붙여서 멀티턴 질문을 반복 테스트하다가, Claude가
"학습 자료에 없으면 추측하지 말라"는 시스템 프롬프트 지시만 믿고 **도구를 아예 호출하지 않은
채** 이전 대화 내용만으로 답하면서 `[1]`을 인용한 사례가 나왔습니다 -- 실제 근거 자료는
하나도 없는데 `sources`가 빈 배열로 나간 것입니다. 시스템 프롬프트로 "검색 먼저"를 지시하는
것만으로는 매번 지켜지지 않는다는 뜻입니다.

고친 방법: 매 턴의 **첫 번째** Claude 호출에서 `tool_choice`를 `{"type": "tool", "name":
"search_study_material"}`로 강제해서, 이번 턴에 적어도 한 번은 실제 검색을 거치도록
만들었습니다. 이후 호출은 다시 `auto`로 풀어줘서 Claude가 재검색이 필요한지 스스로 판단할
수 있게 두었습니다. 같은 멀티턴 시나리오를 3번 반복 실행해서 매번 실제로 검색이 일어나고
`sources`가 채워지는 걸 확인했습니다 (서비스 로그의 `run_agent finished after N call(s)`).

### 무한 루프 방지

Claude가 검색을 계속 반복하며 답을 안 낼 가능성에 대비해 `MAX_TOOL_ITERATIONS`(기본 4) 상한을
두었고, 마지막 호출은 `tool_choice="none"`으로 강제해서 그동안 모은 자료만으로라도 반드시
텍스트 답변을 내도록 만들었습니다 (`.env.example`의 `RAG_MAX_TOOL_ITERATIONS`).

## headingIndex로 섹션까지 딥링크하는 원리

`chunk_lessons.py`는 레슨의 마크다운을 문서 순서대로 훑어 모든 제목(`##`/`###`/`####`)에
0부터 순서를 매기고, 각 청크가 속한 제목의 번호를 `headingIndex`로 저장합니다. 프론트엔드의
`Languages_LessonMarkdown.tsx`는 같은 마크다운을 렌더링할 때 동일한 순서로 각 제목 엘리먼트에
`data-heading-index`를 매기므로, 챗봇 답변의 출처 링크(`/study/{language}/{chapterKey}/{lessonKey}?headingIndex=N`)를
클릭하면 `Study_Class.tsx`가 그 번호의 제목으로 스크롤합니다. 텍스트 슬러그가 아니라 순서
기반이라, 같은 제목이 레슨 안에 여러 번 나와도 항상 정확히 맞습니다.
