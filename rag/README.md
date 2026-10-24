# RAG 챗봇 파이프라인

학습 자료(`backend/src/main/resources/study-seed/*.json`)를 임베딩해서 Elasticsearch에
넣고, 질문이 오면 관련 내용을 검색해 Claude로 답변을 생성하는 챗봇 서비스입니다.

```
study-seed/*.json
  -> chunking/chunk_lessons.py   (레슨을 섹션 단위로 쪼개고 headingIndex 부여)
  -> embedding/embed_chunks.py   (BGE-m3로 임베딩)
  -> indexing/index_chunks.py    (Elasticsearch study_chunks 인덱스에 색인)
  -> service/*.py                (retrieval.py 검색/도구 + agent_graph.py LangGraph 에이전트 + main.py FastAPI)
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

## .env 로딩 순서 버그

`retrieval.py`의 설정값(`TOP_K`, `RAG_X_API_KEY` 등)은 모듈이 import되는 순간 `os.environ`에서
읽힙니다. 한동안 `main.py`가 `retrieval`/`agent_graph`를 먼저 import하고 `load_dotenv()`를
그 다음에 호출했는데, 그러면 import 시점에는 `.env`가 아직 로드되지 않은 상태라 `.env`에 적은
값이 전부 무시됐습니다 -- `RAG_TOP_K=9`를 넣어도 `TOP_K`는 하드코딩된 기본값 5로 남고,
`RAG_X_API_KEY`도 `None`으로 남아서 **공유 비밀키 인증이 조용히 꺼져 있었습니다**
(`verify_auth(None, None)`가 예외 없이 통과). `rag/eval/run_eval.py`는 `retrieval`을 직접
import하면서 `load_dotenv()`를 아예 호출하지 않아 같은 문제가 있었습니다.

고친 방법: `retrieval.py` 맨 위에서 자기 디렉터리의 `.env`를 직접 로드하게 했습니다
(`load_dotenv(Path(__file__).resolve().parent / ".env")`). 실행 디렉터리와 무관하고, 이
모듈을 import하는 쪽(`main.py`, `run_eval.py` 둘 다)이 순서를 신경 쓸 필요가 없습니다.
`load_dotenv`의 기본값(`override=False`)이라 실제 프로세스 환경변수가 `.env`보다 우선하는
동작도 그대로 유지됩니다. `test_env_loading.py`가 서브프로세스로 이걸 검증합니다 -- 같은
프로세스에서 다시 `import retrieval`하면 캐시 때문에 모듈 코드가 재실행되지 않아 버그가
있어도 테스트가 통과해버리므로, 매번 깨끗한 환경의 새 프로세스를 띄워서 확인합니다.

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
"지금 검색이 필요한지, 뭘로 검색할지"를 직접 판단합니다 (`agent_graph.run`).

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
수 있게 두었습니다. 같은 멀티턴 시나리오를 여러 번 반복 실행해서 매번 실제로 검색이 일어나고
`sources`가 채워지는 걸 확인했습니다 (서비스 로그의 `answered with N distinct cited chunk(s)`).

### 무한 루프 방지

Claude가 검색을 계속 반복하며 답을 안 낼 가능성에 대비해 `MAX_TOOL_ITERATIONS`(기본 4) 상한을
두었고, 마지막 호출은 `tool_choice`를 강제로 꺼서(`{"type": "none"}`) 그동안 모은 자료만으로라도
반드시 텍스트 답변을 내도록 만들었습니다 (`.env.example`의 `RAG_MAX_TOOL_ITERATIONS`).

## LangGraph로 재구성

위 에이전트 루프는 원래 `main.py` 안에 직접 짠 `while` 루프였습니다. 같은 동작을
[LangGraph](https://github.com/langchain-ai/langgraph)의 `StateGraph`로 다시 짜서, 전형적인
"ReAct" 그래프 형태(`agent` <-> `tools` 노드, 조건부 엣지로 순환)로 바꿨습니다. 코드는 세
파일로 나뉩니다.

```
retrieval.py     검색(retrieve), 도구 스키마(SEARCH_TOOL), 인용 번호 매기기 -- LangGraph/FastAPI 둘 다 몰라도 되는 순수 로직
agent_graph.py   LangGraph 그래프: agent 노드(Claude 호출) <-> tools 노드(실제 검색 실행)
main.py          FastAPI 엔드포인트. agent_graph.run()을 호출하고 결과를 HTTP 응답으로 포장
```

```
START -> agent --[tool_calls 있음?]--> tools -> agent -> ... -> END
             \\--[없음]----------------------------------------> END
```

### 포팅하면서 다시 터진 "도구 호출 실패" (langchain-anthropic 특유의 함정)

이 리팩터링 자체는 동작을 바꾸려는 게 아니었는데도, 실제 스택에 붙여 같은 멀티턴 시나리오를
돌려보니 **바로 위에서 고쳤던 "검색 생략" 버그가 그대로 재발**했습니다 (`sources`가 다시 빈
배열로 나옴). 서비스 로그에 이런 경고가 찍혀 있었습니다.

```
UserWarning: tool_choice is forced but thinking is enabled. The Anthropic API does not
support forced tool use with thinking. Dropping tool_choice to avoid an API error.
```

원인: `langchain-anthropic`의 `bind_tools()`는 모델에 `thinking`이 켜져 있으면 강제
`tool_choice`(`"any"` 또는 특정 도구 이름)를 **무조건 조용히 버리고** `auto`로 되돌립니다 --
"Anthropic API가 지원하지 않는다"는 주석과 함께요. 그런데 실제로 `anthropic` 파이썬 SDK를
직접 호출해서 `thinking`과 `tool_choice={"type": "any"}`를 같이 보내보면 `claude-sonnet-5`
기준으로는 **멀쩡히 동작합니다** -- 라이브러리가 과도하게 방어적으로 막아놓은 케이스였습니다.
고친 방법: 강제 호출에만 쓰는 `thinking`을 끈 `ChatAnthropic` 인스턴스를 하나 더 만들어서,
그 호출만 그걸 쓰게 했습니다 (`build_graph`). 이 호출의 목적은 검색어를 고르는 것뿐이라 거기서
`thinking`을 잃는 건 큰 손해가 아닙니다.

고치고 나서 똑같은 경고가 **또** 찍혀서 다시 봤더니, 이번엔 다른 줄(`tool_choice="none"`)이
원인이었습니다. `bind_tools`는 문자열 `tool_choice`를 `"any"`/`"auto"`만 특별 처리하고, 그 외
문자열은 전부 "이 이름의 도구를 강제하라"로 해석합니다 -- 즉 `"none"`이라는 문자열을 `{"type":
"tool", "name": "none"}`으로 바꿔버려서, 역시 강제 호출로 취급되어 같은 경고로 조용히
드롭된 것입니다. `tool_choice`를 끄는 올바른 형태는 문자열이 아니라 `{"type": "none"}` 딕셔너리였습니다.

두 군데를 모두 고친 뒤 같은 시나리오를 5번 반복 실행해서 매번 `sources`가 채워지고 경고 로그가
한 줄도 없는 걸 확인했습니다 (`grep -c "Dropping tool_choice" rag-service.log` == 0).

## 멀티턴에서 이전 출처 다시 조회하기

인용 번호(`[1]`, `[2]`...)는 턴마다 새로 매겨집니다 (`format_search_result`). 그런데 과거에는
답변 텍스트만 저장했지 그 턴이 실제로 어떤 자료를 몇 번으로 인용했는지는 저장하지 않아서,
"방금 답변의 [1]번 자료 더 설명해줘" 같은 질문이 오면 Claude가 그 번호가 뭘 가리키는지 알
방법이 없었습니다. 게다가 턴마다 번호가 1부터 다시 매겨지므로, 이전 턴의 [1]과 이번 턴의
[1]이 다른 자료일 수도 있어서 혼동 위험도 있었습니다.

고친 방법: 백엔드가 ASSISTANT 메시지를 저장할 때 그 답변이 인용한 자료들을
`{citationNumber, chunkId}` 쌍으로 같이 저장합니다 (`chat_message.sources_json`,
`RagChatbotService.citedSourcesFrom` -- `ChatbotSourceResponse`의 배열 순서가 곧 인용
번호라 별도 계산 없이 그대로 씁니다). 이 다음 턴에서 히스토리를 불러올 때 그 매핑을
`ChatTurn.sources`로 같이 보내고, `agent_graph.py`의 `_render_assistant_turn`이 그 과거
답변 뒤에 `[이전 답변 자료 매핑: 1=java-08-01-04, ...]` 같은 주석을 붙여서 대화 기록에
넣습니다. 시스템 프롬프트는 이 주석이 그 턴에서만 유효하다는 것, 그리고 번호만 보고 내용을
추측하지 말고 `search_study_material`을 `chunk_id`로 호출해 실제로 다시 조회하라고
지시합니다 (`retrieval.search_or_lookup` -- ES `GET`으로 그 문서를 직접 가져오며, kNN
유사도 검색이 아니라서 다른 자료가 섞여 나올 위험이 없습니다).

실제 스택에서 3턴을 돌려서 검증했습니다: 1턴은 "메소드 선언"을 물어 `[1]=java-04-02-05`를
인용했고, 2턴은 전혀 다른 질문("람다식 문법")을 물어 `[1]=java-08-01-04`를 인용했습니다
(서로 다른 자료인데 번호는 똑같이 1). 3턴에서 "방금 답변의 [1]번 자료 더 설명해줘"라고
물었을 때, Claude는 **2턴의 [1]**(람다식)을 정확히 가리켜 "이전 답변에서 [1]번으로 인용한
자료는 '람다 표현식 작성'입니다"라고 답하며 `chunk_id=java-08-01-04`를 다시 조회해
`sources`에 그 자료 하나만 채워 돌아왔습니다 -- 1턴의 메소드 선언 자료와 혼동하지 않았고,
추측 없이 실제로 다시 조회해서 답했습니다.

sessionId 없는 단발 요청, 그리고 이 기능이 생기기 전에 저장된 `sources_json = NULL`인
과거 행도 "출처 정보 없음"으로 조용히 처리되어(=그냥 텍스트만 있는 일반 턴처럼 취급)
에러 없이 동작합니다 (`RagChatbotService.parseSources`).

## headingIndex로 섹션까지 딥링크하는 원리

`chunk_lessons.py`는 레슨의 마크다운을 문서 순서대로 훑어 모든 제목(`##`/`###`/`####`)에
0부터 순서를 매기고, 각 청크가 속한 제목의 번호를 `headingIndex`로 저장합니다. 프론트엔드의
`Languages_LessonMarkdown.tsx`는 같은 마크다운을 렌더링할 때 동일한 순서로 각 제목 엘리먼트에
`data-heading-index`를 매기므로, 챗봇 답변의 출처 링크(`/study/{language}/{chapterKey}/{lessonKey}?headingIndex=N`)를
클릭하면 `Study_Class.tsx`가 그 번호의 제목으로 스크롤합니다. 텍스트 슬러그가 아니라 순서
기반이라, 같은 제목이 레슨 안에 여러 번 나와도 항상 정확히 맞습니다.
