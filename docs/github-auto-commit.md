# 정답 풀이와 AI 요약의 GitHub 자동 커밋

정답 처리된 본인 제출을 지정한 저장소에 `solution.<ext>` + `README.md`로 자동 기록한다.
[`github-diagnosis.md`](github-diagnosis.md)의 계정 연결(`GithubConnectionEntity`)을 그대로 재사용하고,
**쓰기 권한은 그 연결에 별도로 추가**한다 — 진단은 읽기, 자동 커밋은 쓰기로 권한 자체가 다르다.

AI는 요약 문장만 쓴다. 경로·브랜치·작성자·파일 내용은 전부 서버가 결정하고, GitHub에 실제로 쓰는 동작은
**서버의 작업 처리기가 MCP 도구를 직접 호출**한다 — 모델이 도구를 고르는 구조(진단 기능)가 아니라, 모델
출력(요약 텍스트)을 서버가 검증한 뒤 그 결과를 서버 코드가 그대로 커밋에 꽂아 넣는 구조다. 모델은
`upload_solution`이라는 도구가 존재하는 것조차 모른다.

## 1. 쓰기 권한 — 기존 설치의 권한을 업그레이드

GitHub App은 설치마다 권한이 고정되어 있어, 쓰기를 쓰려면 **App 자체의 선언된 권한**에
`Contents: Read & write`를 추가해야 한다(GitHub 웹 UI에서 App 소유자가 직접 바꿔야 하는 일회성 작업 —
`docs/github-diagnosis.md` 섹션 6의 "App 생성"과 같은 성격의, 제가 대신할 수 없는 단계다). App 권한을
올린 뒤에도 **이미 설치된 사용자 하나하나가 직접 동의**해야 실제로 쓰기가 된다:

1. 사용자가 "쓰기 권한 요청" 버튼 클릭 → `https://github.com/settings/installations/{installationId}`로
   이동(새 플로우가 아니라 GitHub 자체의 설치 관리 페이지 — App 권한이 늘어났으면 거기서 승인 배너가 뜬다).
2. 승인 후 우리 쪽은 그걸 실시간으로 통지받지 않으므로, "권한 다시 확인" 버튼이
   `GET /app/installations/{id}`(App JWT)의 `permissions.contents`를 다시 읽어 `GithubConnectionEntity`의
   `writePermissionGranted`/`writePermissionCheckedAt`를 갱신한다.
3. 이 캐시 값은 **UI 표시용**이다. 실제 업로드 작업(`AutoCommitJobRunner`)은 실행 시점에 항상 설치 토큰을
   발급받아 그 토큰으로 매 요청을 보내고, GitHub가 403을 돌려주면(권한 없음) 그 즉시 캐시도 꺼서 다음부터
   UI가 "권한을 다시 연결해주세요"를 보여준다 — 캐시를 믿고 업로드를 건너뛰지 않는다, 캐시는 업로드
   *전에* 사용자에게 뭘 보여줄지 결정할 때만 쓴다.

자동 저장 활성화에는 **별도의 명시적 동작**이 필요하다. 계정을 연결하거나 쓰기 권한을 승인한 것만으로는
켜지지 않는다 — `PUT .../auto-save/settings`로 저장소/브랜치/경로를 저장해도 `enabled=false`로 남고,
`POST .../auto-save/enable`을 따로 호출해야 켜진다(프런트는 이 호출 전에 미리보기를 보여준다).

## 2. MCP — 서버가 직접 호출하는 쓰기 도구

진단 기능의 `github_mcp_server.py`(읽기 전용 5개 도구)에 **쓰기 도구 1개, `upload_solution`**을 추가한다.
공식 `github-mcp-server`의 `create_or_update_file`류 도구는 파일 1개만 다루고 "브랜치가 그 사이 안
움직였는지"를 우리가 원하는 수준으로 강제하기 어려워, 진단 기능과 같은 이유로 자체 어댑터를 그대로
확장했다 — 읽기 도구들과 전송 방식·허용 목록 강제 방식이 동일하다(섹션 2 참고).

- **호출 경로**: `AutoCommitJobRunner`(Spring, `@Async`) → rag/service의 새 엔드포인트 없이, **Spring이 직접
  MCP 클라이언트로 `github_mcp_server.py` 서브프로세스에 접속**해 `upload_solution`을 호출한다. 진단
  기능은 Python(LangGraph 에이전트)이 MCP 클라이언트였지만, 여기는 모델이 전혀 관여하지 않으므로
  Python/LangGraph를 거칠 이유가 없다 — Java 쪽에 작은 MCP stdio 클라이언트(`GithubMcpClient`, 서브프로세스로
  `python github_mcp_server.py` 실행 후 JSON-RPC로 통신)를 둔다. 서버-서버 간 실제 MCP 프로토콜 왕복이며,
  일반 함수 호출이 아니다.
- **인자**: `installationToken`(환경변수, 요청마다 새로 발급), `owner/repo/branch`(자동저장 설정에서 1개로
  고정), `path`(서버가 계산), `files`(solution/README 내용, 서버가 계산), `commitMessage`(서버가 생성),
  `authorName/authorEmail`(연결된 GitHub 신원에서 서버가 계산, §5), `expectedBaseSha`(작업 시작 시 읽은
  브랜치 HEAD), `expectedFileSha`(그 경로에 이미 파일이 있다면 그 blob sha, 처음이면 null). 이 중 모델이
  정하는 값은 **summary 텍스트 하나**뿐이고, 그마저도 README 본문에 끼워 넣기 전에 구조/길이를 검증한다.
- **서버 측 강제**: `upload_solution`은 진단 도구들과 똑같이 서브프로세스 환경변수의 허용 저장소 1개 밖으로
  owner/repo가 벗어나면 거절한다. 브랜치도 설정된 값과 다르면 거절한다. 경로가 설정된 루트
  디렉터리(`basePath`) 밖이면 거절한다 — "허용된 전용 경로 밖의 파일은 변경하지 않는다"의 실제 강제 지점.
- **원자적 2파일 커밋**: Contents API는 파일 1개씩만 다뤄 원자성이 없다. Git Data API로 blob 2개(solution,
  README) 생성 → `expectedBaseSha`를 베이스로 새 tree 생성 → 그 tree로 commit 생성(parent=`expectedBaseSha`) →
  `PATCH .../git/refs/heads/{branch}`를 **`force=false`**로 업데이트. `force=false`라 그 사이 브랜치가
  움직였으면(= parent가 더 이상 현재 HEAD가 아니면) GitHub가 422를 돌려주고, 그게 곧 "브랜치가 이동한 경우
  강제로 덮어쓰지 않는다"의 실제 매커니즘이다. `expectedFileSha`도 커밋 생성 전에 현재 blob sha와 대조해,
  사용자가 그 파일을 직접 고쳤으면(=다른 sha) 역시 쓰지 않고 충돌로 반환한다.

## 3. 채점 이벤트 연결 — outbox

`CodeChallengeJudgmentService.saveJudgmentHistory`가 이미 `@Transactional`이다. `passed==true`로 저장한
**같은 트랜잭션, 같은 메서드 안**에서 `AutoCommitJobEntity`를 `PENDING`으로 하나 적재한다(해당 사용자의
활성 자동저장 설정이 있을 때만). 저장과 outbox 적재가 한 트랜잭션이라 "저장은 됐는데 작업은 안 만들어짐"이
생기지 않는다. 이 삽입은 외부 호출이 전혀 없는 평범한 INSERT라 웹훅 응답 시간에 영향이 없고, SSE
전달(`SseService`)과도 완전히 분리되어 있다 — 둘 다 건드리지 않는다.

`(judgmentId)` 유니크 제약으로 같은 judgment에 중복 작업이 쌓이지 않는다(중복 웹훅 수신 시 두 번째
삽입은 제약 위반으로 무시). 재도전해서 같은 문제를 다시 통과하면 새 judgmentId이므로 새 작업이 생기고,
저장 경로가 같으므로(문제 ID 기준) **덮어쓰기**(§6)로 처리된다 — 시도별 폴더를 따로 만들지 않는다.

## 4. 저장 내용과 경로

```
{basePath}/{language}/{challengeId:04d}-{slug}/
  solution.{ext}
  README.md
```

- `language`: java/python/javascript/c/cpp (judgment의 `CodeChallengeLanguage`에서 매핑). `ext`: java/py/js/c/cpp.
- `slug`: 문제 제목에서 경로에 위험한 문자(`/ \ : * ? " < > |`, 제어문자)만 제거하고 공백을 `-`로, 60자
  제한 — 한글 제목은 그대로 둔다(GitHub 경로는 UTF-8을 지원하고, 억지로 영문화하면 오히려 식별이 어려워짐).
  슬러그가 비면 `problem`. `challengeId` 네 자리 패딩 + slug라 제목이 바뀌어도 경로 충돌이 없다(ID가 기준).
  `..`나 선행 `/`가 slug에 남지 않도록 별도로 거른다(방어적으로, 위 치환 규칙상 이미 불가능하지만).
- `solution.{ext}`: `CodeReviewService.decodeCode`와 같은 방식(제출 코드는 Base64로 저장되어 있다)으로
  원문을 복원해 그대로 쓴다. 가공·포맷팅하지 않는다.
- `README.md`: 문제 링크(`{DOMAIN_URL}/codingtest/{difficulty}/{challengeId}`), 접근 방법/복잡도/가정은 AI
  요약(§5)에서, 실행 시간·메모리는 judgment의 실제 관측값에서, 사용자가 실제로 저장해 둔 회고가 있으면
  (현재 리뷰·힌트 등 어디에도 회고 입력 필드가 없으므로 — 있다면) 그 값 그대로 포함한다. 문제 전문·숨겨진
  테스트·정답 코드는 어디에도 없다 — AI 요약 요청(§5)에도 보내지 않는다(기존 `RagReviewRequest`와 동일한
  최소 정보 원칙). "사이트에서 보기" 링크 한 줄만 두고 광고 문구는 없다.

## 5. AI 요약

`rag/service/solution_summary_graph.py`(신규, MCP·도구 없음 — review_graph의 "구조 검증 후 저장" 부분만
닮았지 tool-use 루프는 아니다. 입력이 이미 확정돼 더 조사할 게 없다): 제출 코드 + 문제 조건만 근거로
한국어 요약(접근 방법, 시간/공간 복잡도와 가정, 핵심 한 줄)을 구조화해 돌려준다. 해당 제출에 완료된
`CodeReview`가 있으면 그 `summary`/`complexity`를 컨텍스트로 같이 보내 **일치하는 범위에서만** 재사용하고
(다른 제출의 리뷰나 최신 코드를 섞지 않음 — judgmentId로 정확히 조회), 모델이 실행 시간·메모리를 새로
지어내지 못하게 관측값은 응답에서 서버 값으로 덮어쓴다(`CodeReviewService.validated`와 동일한 원칙).

**AI 실패 시 정책**: 요약 생성은 작업당 1회만 시도한다(길게 재시도하지 않음). 실패하면 고정된 기본
문구("AI 요약을 생성하지 못했습니다. 코드는 저장되었습니다.")로 README를 채우고 **코드 저장은 그대로
진행**한다 — AI 실패가 업로드 자체를 막지 않는다. 사용자가 작업을 재시도하면(§6) 그 시도에서 AI 요약을
다시 시도한다.

## 6. 중복·충돌·재시도

- **중복 작업**: §3의 유니크 제약. 동시 두 작업자가 같은 작업을 집으면 `CodeReview`와 같은
  선점 패턴(`@Version` + 상태 전이 검증)으로 하나만 실제로 실행한다.
- **같은 문제 재통과**: 같은 경로를 덮어쓴다(별도 폴더 보존 안 함) — §4의 경로가 문제 ID 기준이라
  자연스러운 결과다. 코드가 이전과 바이트까지 같으면 빈 커밋을 만들지 않고 `COMPLETED`(스킵)로 종료한다.
- **브랜치 이동/수동 수정**: §2의 `force=false`·`expectedFileSha` 대조로 막는다. 막히면 `FAILED`를
  `CONFLICT`로 분류해 자동 재시도하지 않고(원격이 바뀐 이유를 모르니 함부로 또 덮어쓰지 않음) 사용자가
  "다시 시도"를 눌러야 그 시점의 새 HEAD/파일 상태를 다시 읽어 재계산한다.
- **타임아웃**: 업로드 응답이 타임아웃이면 커밋이 실제로 들어갔는지 모르는 상태다. 재시도 전에
  `GET .../commits/{branch}`로 우리가 보낸 커밋 메시지+시간대의 커밋이 이미 있는지 먼저 확인하고,
  있으면 그 sha로 `COMPLETED` 처리, 없으면 새로 시도한다 — 중복 생성 방지.
  - **일시 장애(429/5xx/타임아웃)**: `TRANSIENT`로 분류, `AutoCommitJobScheduler`(`@Scheduled`,
    기존 `OtpCleanUpService`와 같은 `fixedRate` 방식)가 지수 백오프(30초→2분→10분, 최대 3회)로 자동 재시도
    후 그래도 실패하면 `FAILED`로 멈추고 사용자 재시도를 기다린다.
  - **권한 오류(403/404)**: `PERMISSION`으로 분류, 자동 재시도하지 않고 즉시 "설정을 확인해주세요" 상태로
    표시 + `writePermissionGranted=false` 갱신.
- **취소/연결 해제 후 재검증**: 실행 시점(스케줄러가 집어든 바로 그 순간)에 `AutoSaveSettingEntity.enabled`와
  `GithubConnectionEntity.isInstalled()`를 다시 읽는다. 꺼져 있거나 연결이 해제됐으면 `SKIPPED`로 종료하고
  업로드를 시도하지 않는다 — 작업이 큐에 오래 있었어도 "지금" 기준으로 판단한다.
- 외부 호출(AI, GitHub) 동안 트랜잭션을 잡지 않는다 — `CodeReviewService`와 같은 [짧은 tx: 선점] →
  [tx 없음: 외부 호출] → [짧은 tx: 저장] 구조.

## 7. 작성자와 기여 그래프

GitHub는 커밋 작성자 이메일이 그 계정에 연결된 이메일(또는 계정 고유의 noreply 주소)과 일치해야 그
계정의 기여로 인정한다. 이메일 범위(`user:email`)를 새로 요청하거나 사용자 이메일을 저장하지 않고도
항상 통하는 방법은 **ID 기반 noreply**(`{githubUserId}+{githubLogin}@users.noreply.github.com`)이며, 이미
검증된 `GithubConnectionEntity.githubUserId/githubLogin`(§1, 진단 기능에서 확인된 실제 값)로 계산한다 —
사용자의 "이메일 비공개" 설정 여부와 무관하게 항상 유효한 주소라 그 설정을 존중하는 동시에 작동한다.
작성자 이름은 `githubLogin`. 커미터(committer)는 App 자체(`{slug}[bot]`)로 둬도 되고 작성자만 사용자면
충분하다 — GitHub의 기여 인정은 author 기준이다.

리포가 포크이거나 기본 브랜치에 전혀 합쳐지지 않는 브랜치라면 기여로 집계되지 않을 수 있다. UI
문구는 "GitHub 기여 그래프에 표시될 수 있습니다"로만 안내하고 보장하지 않는다. 과거 날짜로 커밋 시각을
조작하는 기능은 만들지 않는다(커밋 author date는 항상 실제 처리 시각).

## 8. 저장과 UI

`AutoSaveSettingEntity`(연결당 1개: repositoryId/branch/basePath/enabled), `AutoCommitJobEntity`(judgment당
1개: 저장소/브랜치/경로 스냅샷, status, attemptCount, nextAttemptAt, errorCategory/errorMessage, commitSha,
commitUrl, summaryVersion). 코딩테스트 결과 화면과 마이페이지 양쪽에서 최근 작업 상태 + 커밋 링크를
보여주고, 완료된 작업은 새로고침해도 재실행하지 않는다(저장된 상태만 조회). 작업 조회는 `userKey` 소유권을
검사한다(분석 기능과 동일).

## 9. 검증의 범위

모의 MCP 세션/모의 AI로 작업 상태 전이, 경로/슬러그 계산, 인코딩 복원, 소유권, 중복·충돌·재시도 분류
로직을 확인했다. **실제로 검증하지 못한 것**: 진짜 GitHub App 쓰기 권한 승인 흐름, 실제 저장소에 대한
Git Data API 왕복(blob/tree/commit/ref 업데이트), 실제 기여 그래프 반영 여부. 테스트용 저장소에 대한
실제 왕복은 운영 자격증명이 준비된 뒤 별도로 1회 수행해야 한다(이번 변경에서는 수행하지 않았다 — "임의의
사용자 저장소에 쓰지 않는다"는 원칙상 제 쪽에서 실제 쓰기 테스트를 수행할 대상 저장소 자체가 없다).
