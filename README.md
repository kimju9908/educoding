#  educoding

개발자를 위한 종합 학습 플랫폼 — 프로그래밍 학습, 코딩테스트, 정보처리기사 대비,
개발자 커뮤니티, 멘토링, 그리고 학습 자료 기반 AI 챗봇까지 하나로 묶은 서비스입니다.

## 아키텍처

```
Frontend (React)
    │
    ▼
Backend (Spring Boot) ──┬──▶ Judge (Flask + Celery + Redis)   코드 채점
                         └──▶ RAG 챗봇 (FastAPI + Elasticsearch + Claude)   학습 Q&A
```

MSA 기반으로 설계되어 코드 채점과 AI 챗봇 응답 생성을 독립된 서비스로 분리했습니다.

## 프로젝트 구조


| 디렉토리                      | 설명                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------ |
| [`backend/`](backend)     | Spring Boot API 서버 (JPA, MySQL, Elasticsearch, JWT 인증)                               |
| [`frontend/`](frontend)   | React + TypeScript + Redux 웹 클라이언트                                                   |
| [`judge/`](judge)         | 코드 채점 마이크로서비스 — `api`(Flask)가 작업을 받아 `worker`(Celery)에 전달, Docker 샌드박스에서 실행          |
| [`rag/`](rag)             | 학습 자료를 임베딩해 Elasticsearch에 색인하고, 질문에 Claude로 답하는 RAG 챗봇 파이프라인 ([자세히](rag/README.md)) |
| [`local/`](local)         | 로컬 개발 환경을 한 번에 띄우고 끄는 스크립트 모음                                                        |
| `educoding-react-native/` | 모바일 앱 (로컬 전용, 이 저장소에는 포함되지 않음)                                                       |


## 주요 기능

- **프로그래밍 학습**: Java, C, C++, JavaScript, Python 이론 + 예제 기반 실습, 진도율 추적
- **코딩테스트**: 실전 IDE 환경, 다국어 지원, 컴파일/런타임 에러 및 메모리 초과 등 상세 피드백
- **정보처리기사 대비**: 기출/모의고사 문제 풀이, 단원별 학습 자료
- **개발자 커뮤니티**: 질문/취업/진로/스터디 게시판, 멘토링 매칭, 유사도 기반 게시글 추천, 팀 프로젝트 모집
- **AI 학습 챗봇**: 학습 페이지 어디서든 질문하면 관련 학습 자료를 찾아 Claude가 답변하고, 출처 링크를 누르면 해당 레슨의 정확한 섹션까지 자동 스크롤

## 기술 스택


| 영역       | 기술                                                      |
| -------- | ------------------------------------------------------- |
| Frontend | React, TypeScript, Redux, MUI                           |
| Backend  | Spring Boot, JPA, MySQL, Elasticsearch, JWT             |
| Judge    | Flask, Celery, Redis, Docker (샌드박스 실행)                  |
| RAG 챗봇   | FastAPI, BGE-m3(임베딩), Elasticsearch(kNN 검색), Claude API |


## 로컬에서 실행하기

```bash
cd local
./start-all.sh
```

MySQL/Redis/Elasticsearch/Mailpit을 띄우고, 백엔드·judge·RAG 챗봇·프론트엔드를 순서대로 실행합니다.
RAG 챗봇이 실제로 답변하려면 `backend/.env`의 `ANTHROPIC_API_KEY`를 본인의 Anthropic API 키로 채워야 합니다.

```bash
cd local
./stop-all.sh
```

전체 스택을 종료합니다. 서비스별 상세 설정은 각 디렉토리의 README를 참고하세요.