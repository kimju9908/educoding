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

## headingIndex로 섹션까지 딥링크하는 원리

`chunk_lessons.py`는 레슨의 마크다운을 문서 순서대로 훑어 모든 제목(`##`/`###`/`####`)에
0부터 순서를 매기고, 각 청크가 속한 제목의 번호를 `headingIndex`로 저장합니다. 프론트엔드의
`Languages_LessonMarkdown.tsx`는 같은 마크다운을 렌더링할 때 동일한 순서로 각 제목 엘리먼트에
`data-heading-index`를 매기므로, 챗봇 답변의 출처 링크(`/study/{language}/{chapterKey}/{lessonKey}?headingIndex=N`)를
클릭하면 `Study_Class.tsx`가 그 번호의 제목으로 스크롤합니다. 텍스트 슬러그가 아니라 순서
기반이라, 같은 제목이 레슨 안에 여러 번 나와도 항상 정확히 맞습니다.
