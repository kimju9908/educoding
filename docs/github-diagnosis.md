# GitHub 코드 기반 학습 진단

사용자가 자신의 GitHub 계정과 대표 저장소(최대 3개)를 연결하면, 실제 코드와 본인 커밋을 근거로
"확인된 구현 경험 / 확인이 부족한 영역 / 추천 학습 주제"를 생성해 기존 맞춤 학습 경로([`learning-path.md`](learning-path.md))와
연결하는 기능이다. **쓰기 권한은 요청하지 않는다** — 분석은 읽기 전용이며, 추후 "풀이 자동 커밋" 기능이 생기면
그때 별도로 쓰기 권한 설치를 다시 요청한다(기존 설치의 권한을 조용히 확장하지 않음).

## 1. GitHub 연결 — 로그인과 저장소 접근 권한을 분리

하나의 **GitHub App**으로 두 단계를 명확히 구분한다. OAuth App이 아니라 GitHub App을 쓰는 이유는,
GitHub App만 "설치 단위로 저장소를 선택해 읽기 전용 권한만 부여"할 수 있고(OAuth App은 계정 전체에
토큰 범위가 걸린다), 설치 단위 권한이 그대로 "분석은 읽기 권한만 사용", "사용자가 저장소를 직접 선택"
요구사항과 맞기 때문이다. GitHub App은 자체적으로 "Sign in with GitHub App" user-to-server OAuth
흐름도 제공하므로 로그인용 OAuth App을 따로 만들 필요가 없다 — 이후 "풀이 자동 커밋" 기능도 같은 App의
설치 권한을 Contents:write로 확장해 재사용할 수 있다.

```
1단계 GitHub 로그인(식별)              2단계 저장소 접근 권한 연결(설치)
─────────────────────────            ──────────────────────────────
GET /api/github/oauth/start          GET /api/github/install/start
  → authorize URL(state 서명)          → github.com/apps/<slug>/installations/new?state=
  → github.com/login/oauth/authorize    (App 설정에서 "Request user authorization
  → 콜백 code,state                      (OAuth) during installation" 체크 필수)
  → code→user token→GET /user          → 콜백 installation_id, setup_action, code, state
  → githubConnection.githubUserId 저장    → code→user token→GET /user로 재확인:
                                           로그인된 계정과 설치한 계정이 같아야 함
                                         → GET /user/installations(user token)로
                                           installation_id가 실제로 이 사용자 소유인지 재검증
                                         → GET /app/installations/{id}(App JWT)로
                                           설치 계정·레포 범위 확인 후 저장
```

`GithubConnectionEntity`는 `githubUserId/githubLogin`(1단계)과 `installationId`(2단계)를 별도
컬럼으로 두어, "로그인만 한 상태"와 "설치까지 완료한 상태"를 데이터로도 구분한다. 두 단계 모두
`state` 파라미터에 서명된 JWT(우리 `jwt.secret-key` 재사용, `sub=userKey`, 5분 만료, 1회성 nonce)를
실어 보내고 콜백에서 검증한다 — 콜백은 GitHub가 브라우저를 통해 호출하는 전체 페이지 리다이렉트라
`Authorization` 헤더가 없으므로, "누가 요청했는지"는 쿠키/세션이 아니라 이 서명된 state로만 판단한다
(SecurityConfig에 콜백 두 경로만 permitAll, 나머지 `/api/github/**`는 기존 JWT 인증 필요).
GitHub이 되돌려주는 `code`로 받은 user token은 신원 재확인 직후 버리고 저장하지 않는다.

연결 해제(`DELETE /api/github/connection`)는 로컬 저장을 비활성화(soft revoke)할 뿐, GitHub 쪽 설치
자체를 API로 지우지 않는다 — 제3자 플랫폼의 설치를 사용자 동의 없이 원격으로 삭제하는 건 되돌리기 어려운
동작이라 더 위험하다고 판단했다. 해제 화면에는 GitHub 설치 관리 페이지로 가는 링크를 같이 보여준다.
반대로 **GitHub 쪽에서 먼저 App을 제거한 경우를 실시간으로 반영하는 웹훅은 이번 범위에 없다** — 다음
분석 요청 시 설치 토큰 발급이 401/404로 실패하면 그때 연결을 무효로 표시한다(남은 제약으로 보고).

## 2. MCP 연결 — 왜 자체 어댑터인가

공식 `github/github-mcp-server`를 먼저 검토했다. 공식 서버는 프로세스 하나에 고정된 PAT/토큰
하나로 떠 있는 것을 기본 모델로 하고, 요청마다 다른 사용자의 설치 토큰·다른 허용 저장소로 범위를
좁혀 뜨는 멀티테넌트 시나리오에 맞는 표준 배포 형태가 아니다(원격 호스팅 버전은 OAuth를 지원하지만
우리가 통제할 수 없는 외부 인프라). 이 기능은 "이번 요청에서 분석을 요청한 사용자가 승인한 설치 토큰과
저장소 밖으로 절대 못 나가야 한다"는 요구가 핵심이라, 요청 단위로 토큰·허용 목록을 주입하고 서버가
그 경계를 강제하는 자체 MCP 서버(`rag/service/github_mcp_server.py`)를 구현했다. 모델이 owner/repo
인자를 바꿔 호출해도 서버가 허용 목록과 비교해 거절한다 — "모델이 인자를 바꿔도 못 나간다"는 보장은
도구 스키마가 아니라 이 서버 쪽 실행 코드에 있다.

- **전송**: stdio. `rag/service/main.py`의 `/github/diagnose` 요청마다 서브프로세스로
  `github_mcp_server.py`를 띄우고 요청이 끝나면 종료한다(요청 수명 = 서버 수명).
- **인증**: 설치 토큰(1시간 TTL, Spring이 매 분석마다 새로 발급, 저장하지 않음)과 허용 저장소 목록
  (owner/repo/head_sha 고정 스냅샷), 분석 대상 GitHub 로그인(커밋 작성자 필터용)을 서브프로세스
  환경변수로 주입한다. 모델 메시지에는 토큰이 전혀 들어가지 않는다.
- **제공 도구(읽기 전용 5개)**: `list_repositories`(인자 없음, 허용 목록 그대로), `list_directory`,
  `get_file_content`, `list_commits`(작성자=연결된 github_login 고정), `get_commit`. 쓰기 도구는
  없다. 저장소 스크립트/설치 명령은 실행하지 않으며, 파일 안 문장을 도구 실행 지시로 취급하지 않는다
  (시스템 프롬프트 + 데이터 구분자로 고지).
- **클라이언트**: `rag/service/github_graph.py`가 `mcp` SDK의 `stdio_client`/`ClientSession`으로
  이 서버에 접속해 도구 목록을 가져오고, Claude의 forced-tool 루프(`review_graph.build_forced_tool_graph`와
  같은 구조를 비동기로 다시 구현— MCP 호출이 async라서 그래프 노드도 async여야 함)에서 Claude가
  고른 MCP 도구를 그대로 호출한다. **일반 함수 호출로 구현하고 MCP라고 부르지 않기 위해** 실제로
  MCP 프로토콜(stdio JSON-RPC)을 거친다 — Claude tool-use → `session.call_tool()` → MCP 서버 →
  GitHub REST.

## 3. 분석 범위와 비용 제한

- 저장소 1~3개, 사용자가 설치 범위 안에서 직접 선택(`GithubRepositoryEntity.selected`).
- 분석 시작 시 각 저장소의 default branch HEAD SHA를 스냅샷해 그 커밋에 고정한다(분석 중 push돼도
  결과가 바뀌지 않음). 결과에는 분석한 정확한 SHA를 저장한다.
- 파일 수·크기 상한: 저장소당 `list_directory` 호출 100회, `get_file_content` 호출 40회,
  파일 1개 60KB, 전체 도구 호출 24회(세 저장소 합산), 시간 예산 240초 — 모두 환경변수로 조정 가능
  (`rag/service/.env`). 초과 시 "일부만 확인했다"는 notice를 결과에 남기고 중단한다.
- 제외 대상: `node_modules`, `vendor`, `dist`, `build`, `.git`, 바이너리/이미지/폰트 확장자,
  `*.lock`/`package-lock.json`/`yarn.lock`/`*.min.*`, `.env*`, 파일/경로에 `secret`/`credential`/
  `token`/`key`가 들어간 항목(대소문자 무관) — `github_mcp_server.py`의 고정 규칙으로 걷어낸다.
- README만으로 "기술 사용 경험"을 단정하지 말라는 규칙과, 저장소 소유자=전체 작성자가 아니라는
  규칙을 시스템 프롬프트에 명시하고, `list_commits`/`get_commit`을 연결된 GitHub 계정의 작성자로
  서버가 강제한다. 포크·템플릿·팀 저장소·기여자를 알 수 없는 코드는 "확인이 부족한 영역"으로
  표시하도록 프롬프트에 지시한다(모델 의존 — 서버가 포크 여부를 강제 검증하진 않는다. 남은 제약).
- 코드는 읽기만 한다. 설치 명령/스크립트를 실행하는 도구 자체가 없다.

## 4. 진단 결과와 환각 방지

모델은 반드시 `submit_diagnosis` 도구로 끝낸다. 세 항목(confirmed/gaps/recommendedTopics)과
`scopeNote`를 받는데:

- `confirmed[].evidenceRefs`(저장소/경로/커밋 SHA/줄 범위)는 **이번 실행 중 실제 도구 호출로 반환된
  값의 레지스트리**(`_Run.verified`, 파일 경로·커밋 SHA를 호출 결과에서만 채움)와 대조해, 레지스트리에
  없는 참조가 하나라도 있으면 `submit_diagnosis` 전체를 오류로 돌려보내 모델이 고치게 한다. 이 레지스트리는
  모델이 채울 수 없고 도구 실행 코드만 채운다.
- `recommendedTopics[].concept`은 Spring이 보낸 `allowedConcepts`(카탈로그의 실제 개념 목록) 안에서만
  고를 수 있다 — 새 개념을 지어낼 수 없다. Python이 1차로 검증하고, Spring이 응답을 받은 뒤 같은 목록으로
  **다시** 검증한다(학습 경로의 `validateSelection`과 같은 이중 검증 원칙). Spring은 이후 각 concept을
  `GithubCatalogLinker`로 실제 강의/문제 링크에 연결하거나, 대응 콘텐츠가 없으면 "지원 부족"으로 표시한다
  — 제목·링크는 항상 서버 카탈로그에서 가져오고 모델이 URL을 짓지 않는다.
- "비동기 실력이 부족함"처럼 관찰 부재를 능력 부족으로 바꿔 쓰지 말라, 라이브러리 설치만으로 활용 능력을
  단정하지 말라, 전체 실력/취업 수준을 점수화하지 말라는 규칙을 시스템 프롬프트에 명시한다. 근거가 없으면
  `gaps`로 분류하고 `confidence`/`limits` 문구를 비우지 않도록 스키마에서 강제한다.
- GitHub 관측은 사이트 풀이 성과와 분리된 **보조 출처**로 저장한다(`GithubAnalysisEntity`는
  `learning_plan`과 별도 테이블). 학습 경로 자체의 개념 점수·후보 검증 규칙은 건드리지 않는다.

## 5. 저장·백그라운드 실행

학습 경로와 달리 분석은 길어질 수 있어(MCP 왕복 다수 + Claude 호출 최대 18회) **진짜 백그라운드**로
돌린다: 요청을 받으면 짧은 트랜잭션으로 `PENDING` 행을 선점하고 즉시 202로 반환, `@Async` 스레드가
트랜잭션 밖에서 설치 토큰 발급 → rag 서비스 호출(최대 260초) → 결과 검증·저장까지 수행한다. 프런트는
`GET /api/github/analysis/latest`를 폴링한다(학습 경로 폴링과 동일한 "sequence ref로 늦은 응답
무시" 패턴).

- 같은 사용자의 `PENDING`/`RUNNING` 요청이 있으면 새 요청은 그 상태를 그대로 반환(중복 실행 방지).
  180초 넘게 멈춘 `PENDING`/`RUNNING`은 재시도 요청으로 재선점할 수 있다.
- 취소(`POST /api/github/analysis/{id}/cancel`)는 DB 상태만 `CANCELLED`로 바꾸고, 실행 중 스레드는
  각 저장소/각 도구 호출 사이에서 상태를 다시 읽어 취소를 확인하면 결과를 저장하지 않고 중단한다(이미
  보낸 Claude/MCP 호출 하나를 중간에 강제로 끊지는 못한다 — best-effort).
- 저장 항목: 분석 대상 저장소·고정 SHA, 규칙/프롬프트 버전, 요청 시각·완료 시각, 원본 결과 JSON,
  Spring이 링크를 붙인 뷰. `GET /api/github/analysis/{id}`는 저장된 결과만 반환하고 AI를 다시
  호출하지 않는다(재분석은 별도 POST).
- 저장소가 없거나 연결하지 않은 사용자는 기존 학습 경로/코딩테스트 진입에 영향받지 않는다 — 이 기능은
  전부 선택적 추가 화면이다.

## 6. 권한 설정 체크리스트 (GitHub App 생성 시)

실제 App 생성은 GitHub 웹 UI에서 사용자가 직접 해야 한다(계정 소유권이 필요해 API로 대신할 수 없음).
`https://github.com/settings/apps/new`에서:

- Repository permissions: **Contents: Read-only**, **Metadata: Read-only**(자동). 그 외 전부 No access.
- Account permissions: 불필요(신원은 user-to-server OAuth의 `GET /user`만으로 충분).
- "Request user authorization (OAuth) during installation" **체크** — 설치 콜백에 `code`를 같이 받아
  설치자 신원을 그 자리에서 재확인하기 위함.
- User authorization callback URL: `{DOMAIN}/api/github/oauth/callback`
- Setup URL: `{DOMAIN}/api/github/install/callback`, "Redirect on update" 체크 권장.
- Webhook: 비활성화해도 된다(이번 범위에서 사용하지 않음).
- 생성 후 `backend/.env`에 `GITHUB_APP_ID`, `GITHUB_APP_SLUG`, `GITHUB_APP_CLIENT_ID`,
  `GITHUB_APP_CLIENT_SECRET`, `GITHUB_APP_PRIVATE_KEY_PATH`(PKCS#8로 변환한 PEM 경로 —
  GitHub가 주는 키는 PKCS#1이라 `openssl pkcs8 -topk8 -nocrypt -in original.pem -out pkcs8.pem`로
  한 번 변환해야 함)를 채운다. `ANTHROPIC_API_KEY`와 같은 위치·같은 "비밀은 백엔드만 보관" 원칙을
  따른다.

## 7. 검증의 범위

- `GithubConnectionServiceTest`: 다른 사용자의 state/설치 거절, 설치-로그인 계정 불일치 거절,
  허용 저장소 밖 선택 거절, 연결 해제.
- `GithubAnalysisServiceTest`: 중복 요청 반환, 180초 재선점, 취소, 결과 재검증(허용 개념 밖 거절),
  트랜잭션 경계(선점/저장만 트랜잭션, 외부 호출은 트랜잭션 밖).
- `test_github_mcp_server.py`/`test_github_graph.py`: 허용 목록 밖 owner/repo 거절, 파일 크기·제외
  패턴, 커밋 작성자 필터, evidenceRefs 대조 실패 시 재요청, recommendedTopics 허용 목록 검증, 예산 초과.
- **실제로 검증하지 못하는 것**: 진짜 GitHub App 자격증명으로의 OAuth/설치 왕복, 진짜 설치 토큰으로의
  GitHub REST 호출, 실제 Claude 모델의 진단 품질. 전부 모의 MCP 세션/모의 모델로 흐름과 검증 로직만
  확인했다 — 운영 자격증명이 준비되면 스테이징에서 한 번 실제 왕복을 거쳐야 한다.
