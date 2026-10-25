package com.kh.totalproject.service;

import com.kh.totalproject.constant.codechallenge.enums.CodeChallengeDifficulty;
import com.kh.totalproject.constant.codechallenge.enums.CodeChallengeLanguage;
import com.kh.totalproject.constant.codechallenge.enums.FailureCause;
import com.kh.totalproject.constant.codereview.CodeReviewStatus;
import com.kh.totalproject.dto.request.RagReviewRequest;
import com.kh.totalproject.dto.response.CodeReviewContent;
import com.kh.totalproject.dto.response.CodeReviewResponse;
import com.kh.totalproject.dto.response.ReviewTargetResponse;
import com.kh.totalproject.entity.CodeChallenge;
import com.kh.totalproject.entity.CodeChallengeJudgment;
import com.kh.totalproject.entity.CodeReview;
import com.kh.totalproject.entity.User;
import com.kh.totalproject.exception.CodeReviewException;
import com.kh.totalproject.exception.CodeReviewGenerationException;
import com.kh.totalproject.repository.CodeChallengeJudgmentRepository;
import com.kh.totalproject.repository.CodeReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * CodeReviewService의 권한 확인·상태 전이·중복 방지·저장 경로를 검증합니다.
 * RAG 서비스 호출(RagReviewClient)과 리포지토리는 전부 Mockito로 대체한 "모의" 테스트이며,
 * 실제 Claude 호출 결과의 품질은 여기서 다루지 않습니다.
 * code_review 테이블은 AtomicReference 한 칸짜리 가짜 저장소로 흉내 냅니다.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class CodeReviewServiceTest {

    private static final long OWNER = 1L;
    private static final long OTHER_USER = 2L;
    private static final long JUDGMENT_ID = 100L;
    private static final String CODE = "import sys\n\nn = int(input())\nprint(sum(range(n + 1)))\n";

    @Mock
    private CodeChallengeJudgmentRepository judgmentRepository;

    @Mock
    private CodeReviewRepository codeReviewRepository;

    @Mock
    private RagReviewClient ragReviewClient;

    private CodeReviewService service;
    private final AtomicReference<CodeReview> stored = new AtomicReference<>();

    // 콜백을 그 자리에서 실행만 하는 트랜잭션 템플릿 (실제 DB 트랜잭션 없음)
    private static class ImmediateTransactionTemplate extends TransactionTemplate {
        int executions = 0;

        @Override
        public <T> T execute(TransactionCallback<T> action) {
            executions++;
            return action.doInTransaction((TransactionStatus) null);
        }
    }

    private ImmediateTransactionTemplate transactionTemplate;

    @BeforeEach
    void setUp() {
        transactionTemplate = new ImmediateTransactionTemplate();
        service = new CodeReviewService(judgmentRepository, codeReviewRepository, ragReviewClient, transactionTemplate);

        when(codeReviewRepository.findByJudgment_JudgmentIdAndReviewVersion(anyLong(), eq(CodeReviewService.REVIEW_VERSION)))
                .thenAnswer(inv -> Optional.ofNullable(stored.get())
                        .filter(r -> r.getJudgment().getJudgmentId().equals(inv.getArgument(0))));
        when(codeReviewRepository.findById(anyLong()))
                .thenAnswer(inv -> Optional.ofNullable(stored.get()));
        when(codeReviewRepository.saveAndFlush(any(CodeReview.class))).thenAnswer(inv -> {
            CodeReview review = inv.getArgument(0);
            if (review.getReviewId() == null) {
                ReflectionTestUtils.setField(review, "reviewId", 500L);
            }
            ReflectionTestUtils.setField(review, "updatedAt", LocalDateTime.now());
            stored.set(review);
            return review;
        });
    }

    // ---------- fixtures ----------

    private static User user(long userKey) {
        User user = new User();
        user.setUserKey(userKey);
        return user;
    }

    private static CodeChallenge challenge() {
        CodeChallenge challenge = new CodeChallenge();
        challenge.setChallengeId(7L);
        challenge.setTitle("1부터 N까지의 합");
        challenge.setDescription("N이 주어질 때 1부터 N까지의 합을 출력하세요.");
        challenge.setCond("1 <= N <= 10^6");
        challenge.setCategory("수학");
        challenge.setDifficulty(CodeChallengeDifficulty.values()[0]);
        challenge.setTimeLimitMs(1000);
        challenge.setMemoryLimitMb(128f);
        return challenge;
    }

    // 실제 저장 형식과 같게, 제출 코드는 Base64로 인코딩해 넣는다
    private static String b64(String code) {
        return Base64.getEncoder().encodeToString(code.getBytes(StandardCharsets.UTF_8));
    }

    private static CodeChallengeJudgment judgment(long id, long ownerKey, boolean passed, String code) {
        return judgmentWithStoredCode(id, ownerKey, passed, b64(code));
    }

    private static CodeChallengeJudgment judgmentWithStoredCode(long id, long ownerKey, boolean passed, String storedCode) {
        CodeChallengeJudgment judgment = CodeChallengeJudgment.builder()
                .user(user(ownerKey))
                .codeChallenge(challenge())
                .passed(passed)
                .codeLanguage(CodeChallengeLanguage.PYTHON3)
                .code(storedCode)
                .codeByteSize(storedCode.length())
                .submittedAt(LocalDateTime.now())
                .maxElapsedTimeMs(42)
                .maxMemoryUsageMb(9.5f)
                .failureCause(passed ? null : FailureCause.WRONG_ANSWER)
                .jobId("job-" + id)
                .build();
        ReflectionTestUtils.setField(judgment, "judgmentId", id);
        return judgment;
    }

    private CodeChallengeJudgment givenJudgment(long ownerKey, boolean passed) {
        CodeChallengeJudgment judgment = judgment(JUDGMENT_ID, ownerKey, passed, CODE);
        when(judgmentRepository.findById(JUDGMENT_ID)).thenReturn(Optional.of(judgment));
        return judgment;
    }

    private static CodeReviewContent content(List<CodeReviewContent.Improvement> improvements,
                                             List<CodeReviewContent.Lesson> lessons) {
        return new CodeReviewContent(
                "합 공식을 쓰면 더 간단합니다.",
                List.of("입력을 한 번만 읽습니다."),
                new CodeReviewContent.Complexity("O(N)", "O(1)", List.of("N은 입력 정수")),
                // 모델이 지어낸 관측값 -- 저장 시 DB 값으로 덮어써져야 한다
                new CodeReviewContent.ObservedMetrics(1, 1f),
                improvements,
                lessons
        );
    }

    private static CodeReviewContent validContent() {
        return content(
                List.of(new CodeReviewContent.Improvement("suggestion", "합 공식 사용", 4, 4,
                        "n*(n+1)//2로 O(1)에 계산할 수 있습니다.", "print(n * (n + 1) // 2)")),
                List.of(new CodeReviewContent.Lesson("python:ch1:l1:0", "반복문 - range",
                        "/study/python/ch1/l1?headingIndex=0"))
        );
    }

    private CodeReview givenStoredReview(CodeChallengeJudgment judgment, CodeReviewStatus status, LocalDateTime updatedAt) {
        CodeReview review = CodeReview.builder()
                .user(judgment.getUser())
                .judgment(judgment)
                .reviewVersion(CodeReviewService.REVIEW_VERSION)
                .build();
        ReflectionTestUtils.setField(review, "reviewId", 500L);
        ReflectionTestUtils.setField(review, "status", status);
        ReflectionTestUtils.setField(review, "updatedAt", updatedAt);
        if (status == CodeReviewStatus.FAILED) {
            ReflectionTestUtils.setField(review, "errorMessage", "AI 응답이 지연되었습니다.");
        }
        stored.set(review);
        return review;
    }

    private static HttpStatus statusOf(Throwable e) {
        return ((CodeReviewException) e).getStatus();
    }

    // ---------- 본인 정답 제출: 성공 ----------

    @Test
    void ownPassedSubmission_generatesAndStoresValidatedReview() {
        givenJudgment(OWNER, true);
        when(ragReviewClient.generate(any())).thenReturn(validContent());

        CodeReviewResponse response = service.requestReview(JUDGMENT_ID, OWNER);

        assertThat(response.status()).isEqualTo(CodeReviewStatus.COMPLETED);
        assertThat(response.judgmentId()).isEqualTo(JUDGMENT_ID);
        assertThat(response.reviewVersion()).isEqualTo(CodeReviewService.REVIEW_VERSION);
        assertThat(response.review().improvements()).hasSize(1);
        // 관측값은 모델 응답이 아니라 DB 채점 값
        assertThat(response.review().observedMetrics().maxElapsedTimeMs()).isEqualTo(42);
        assertThat(response.review().observedMetrics().maxMemoryUsageMb()).isEqualTo(9.5f);
        assertThat(stored.get().getStatus()).isEqualTo(CodeReviewStatus.COMPLETED);
        assertThat(stored.get().getContentJson()).contains("합 공식 사용");
        // 선점 tx → (tx 없이 AI 호출) → 저장 tx: 트랜잭션이 정확히 두 번만 열린다
        assertThat(transactionTemplate.executions).isEqualTo(2);
    }

    @Test
    void ragRequest_isBuiltFromDbValuesOfThatExactSubmission() {
        givenJudgment(OWNER, true);
        when(ragReviewClient.generate(any())).thenReturn(validContent());

        service.requestReview(JUDGMENT_ID, OWNER);

        ArgumentCaptor<RagReviewRequest> captor = ArgumentCaptor.forClass(RagReviewRequest.class);
        verify(ragReviewClient).generate(captor.capture());
        RagReviewRequest request = captor.getValue();
        assertThat(request.submission().submissionId()).isEqualTo(JUDGMENT_ID);
        // DB에는 Base64로 저장돼 있지만 AI에는 디코딩한 원문을 보낸다
        assertThat(request.submission().code()).isEqualTo(CODE);
        assertThat(request.submission().language()).isEqualTo("PYTHON3");
        assertThat(request.submission().maxElapsedTimeMs()).isEqualTo(42);
        assertThat(request.challenge().challengeId()).isEqualTo(7L);
        assertThat(request.challenge().condition()).isEqualTo("1 <= N <= 10^6");
        assertThat(request.challenge().timeLimitMs()).isEqualTo(1000);
    }

    // ---------- 권한/대상 확인 ----------

    @Test
    void otherUsersSubmission_isRejectedWithoutCallingAi() {
        givenJudgment(OTHER_USER, true);

        assertThatThrownBy(() -> service.requestReview(JUDGMENT_ID, OWNER))
                .isInstanceOf(CodeReviewException.class)
                .satisfies(e -> assertThat(statusOf(e)).isEqualTo(HttpStatus.FORBIDDEN));
        assertThatThrownBy(() -> service.getReview(JUDGMENT_ID, OWNER))
                .satisfies(e -> assertThat(statusOf(e)).isEqualTo(HttpStatus.FORBIDDEN));
        verify(ragReviewClient, never()).generate(any());
        verify(codeReviewRepository, never()).saveAndFlush(any());
    }

    @Test
    void unpassedSubmission_isRejected() {
        givenJudgment(OWNER, false);

        assertThatThrownBy(() -> service.requestReview(JUDGMENT_ID, OWNER))
                .satisfies(e -> assertThat(statusOf(e)).isEqualTo(HttpStatus.CONFLICT));
        verify(ragReviewClient, never()).generate(any());
        verify(codeReviewRepository, never()).saveAndFlush(any());
    }

    @Test
    void missingSubmission_isRejected() {
        when(judgmentRepository.findById(JUDGMENT_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.requestReview(JUDGMENT_ID, OWNER))
                .satisfies(e -> assertThat(statusOf(e)).isEqualTo(HttpStatus.NOT_FOUND));
        verify(ragReviewClient, never()).generate(any());
    }

    @Test
    void tooLongCode_isRejectedBeforeCreatingReview() {
        CodeChallengeJudgment judgment = judgment(JUDGMENT_ID, OWNER, true, "x".repeat(CodeReviewService.MAX_CODE_CHARS + 1));
        when(judgmentRepository.findById(JUDGMENT_ID)).thenReturn(Optional.of(judgment));

        assertThatThrownBy(() -> service.requestReview(JUDGMENT_ID, OWNER))
                .satisfies(e -> assertThat(statusOf(e)).isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY));
        verify(codeReviewRepository, never()).saveAndFlush(any());
    }

    @Test
    void undecodableStoredCode_isRejectedBeforeCreatingReview() {
        CodeChallengeJudgment judgment = judgmentWithStoredCode(JUDGMENT_ID, OWNER, true, "not base64 !!");
        when(judgmentRepository.findById(JUDGMENT_ID)).thenReturn(Optional.of(judgment));

        assertThatThrownBy(() -> service.requestReview(JUDGMENT_ID, OWNER))
                .satisfies(e -> assertThat(statusOf(e)).isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY));
        verify(codeReviewRepository, never()).saveAndFlush(any());
    }

    @Test
    void decodeCode_handlesUtf8() {
        assertThat(CodeReviewService.decodeCode(b64("print('안녕')\n"))).isEqualTo("print('안녕')\n");
    }

    @Test
    void findTargetByJob_returnsThatJobsJudgmentOnlyToItsOwner() {
        CodeChallengeJudgment mine = judgment(JUDGMENT_ID, OWNER, true, CODE);
        CodeChallengeJudgment theirs = judgment(101L, OTHER_USER, true, CODE);
        when(judgmentRepository.findFirstByJobIdOrderByJudgmentIdDesc("job-100")).thenReturn(Optional.of(mine));
        when(judgmentRepository.findFirstByJobIdOrderByJudgmentIdDesc("job-101")).thenReturn(Optional.of(theirs));
        when(judgmentRepository.findFirstByJobIdOrderByJudgmentIdDesc("job-404")).thenReturn(Optional.empty());

        ReviewTargetResponse target = service.findTargetByJob("job-100", OWNER);
        assertThat(target.judgmentId()).isEqualTo(JUDGMENT_ID);
        assertThat(target.challengeId()).isEqualTo(7L);
        assertThat(target.passed()).isTrue();

        assertThatThrownBy(() -> service.findTargetByJob("job-101", OWNER))
                .satisfies(e -> assertThat(statusOf(e)).isEqualTo(HttpStatus.FORBIDDEN));
        assertThatThrownBy(() -> service.findTargetByJob("job-404", OWNER))
                .satisfies(e -> assertThat(statusOf(e)).isEqualTo(HttpStatus.NOT_FOUND));
        assertThatThrownBy(() -> service.findTargetByJob(" ", OWNER))
                .satisfies(e -> assertThat(statusOf(e)).isEqualTo(HttpStatus.BAD_REQUEST));
    }

    // ---------- 특정 제출-리뷰 연결 ----------

    @Test
    void reviewStaysLinkedToItsOwnSubmission() {
        CodeChallengeJudgment first = givenJudgment(OWNER, true);
        givenStoredReview(first, CodeReviewStatus.COMPLETED, LocalDateTime.now());
        ReflectionTestUtils.setField(stored.get(), "contentJson", "{\"summary\":\"first\"}");

        // 같은 유저의 다른(더 최신) 제출은 첫 제출의 리뷰를 받지 않는다
        CodeChallengeJudgment newer = judgment(200L, OWNER, true, CODE);
        when(judgmentRepository.findById(200L)).thenReturn(Optional.of(newer));

        CodeReviewResponse forNewer = service.getReview(200L, OWNER);
        assertThat(forNewer.judgmentId()).isEqualTo(200L);
        assertThat(forNewer.status()).isNull();

        CodeReviewResponse forFirst = service.getReview(JUDGMENT_ID, OWNER);
        assertThat(forFirst.judgmentId()).isEqualTo(JUDGMENT_ID);
        assertThat(forFirst.status()).isEqualTo(CodeReviewStatus.COMPLETED);
        assertThat(forFirst.review().summary()).isEqualTo("first");
    }

    // ---------- 중복 요청 / 저장 결과 재사용 ----------

    @Test
    void completedReview_isReusedWithoutCallingAiAgain() {
        givenJudgment(OWNER, true);
        when(ragReviewClient.generate(any())).thenReturn(validContent());

        CodeReviewResponse first = service.requestReview(JUDGMENT_ID, OWNER);
        CodeReviewResponse second = service.requestReview(JUDGMENT_ID, OWNER);

        assertThat(second.status()).isEqualTo(CodeReviewStatus.COMPLETED);
        assertThat(second.review()).isEqualTo(first.review());
        verify(ragReviewClient, times(1)).generate(any());
    }

    @Test
    void freshPendingReview_isReturnedAsIsWithoutSecondGeneration() {
        CodeChallengeJudgment judgment = givenJudgment(OWNER, true);
        givenStoredReview(judgment, CodeReviewStatus.PENDING, LocalDateTime.now().minusSeconds(10));

        CodeReviewResponse response = service.requestReview(JUDGMENT_ID, OWNER);

        assertThat(response.status()).isEqualTo(CodeReviewStatus.PENDING);
        verify(ragReviewClient, never()).generate(any());
        verify(codeReviewRepository, never()).saveAndFlush(any());
    }

    @Test
    void concurrentInsertLosingUniqueConstraint_returnsWinnersState() {
        CodeChallengeJudgment judgment = givenJudgment(OWNER, true);
        CodeReview winner = CodeReview.builder().user(judgment.getUser()).judgment(judgment)
                .reviewVersion(CodeReviewService.REVIEW_VERSION).build();
        ReflectionTestUtils.setField(winner, "updatedAt", LocalDateTime.now());
        // 우리 요청의 조회 시점엔 없었지만, insert 시점엔 다른 요청이 먼저 넣어 유니크 제약 위반
        when(codeReviewRepository.saveAndFlush(any(CodeReview.class))).thenAnswer(inv -> {
            stored.set(winner);
            throw new DataIntegrityViolationException("Duplicate entry for uk_code_review_judgment_version");
        });

        CodeReviewResponse response = service.requestReview(JUDGMENT_ID, OWNER);

        assertThat(response.status()).isEqualTo(CodeReviewStatus.PENDING);
        verify(ragReviewClient, never()).generate(any());
    }

    @Test
    void stalePendingReview_isReclaimedAndRegenerated() {
        CodeChallengeJudgment judgment = givenJudgment(OWNER, true);
        givenStoredReview(judgment, CodeReviewStatus.PENDING,
                LocalDateTime.now().minusSeconds(CodeReviewService.STALE_PENDING_SECONDS + 60));
        when(ragReviewClient.generate(any())).thenReturn(validContent());

        CodeReviewResponse response = service.requestReview(JUDGMENT_ID, OWNER);

        assertThat(response.status()).isEqualTo(CodeReviewStatus.COMPLETED);
        assertThat(stored.get().getAttemptCount()).isEqualTo(2);
    }

    // ---------- AI 오류 / 형식 오류 → 재시도 가능 ----------

    @Test
    void aiError_isStoredAsFailed_thenRetrySucceeds() {
        givenJudgment(OWNER, true);
        when(ragReviewClient.generate(any()))
                .thenThrow(new CodeReviewGenerationException("AI 응답이 지연되었습니다. 잠시 후 다시 시도해주세요."))
                .thenReturn(validContent());

        CodeReviewResponse failed = service.requestReview(JUDGMENT_ID, OWNER);
        assertThat(failed.status()).isEqualTo(CodeReviewStatus.FAILED);
        assertThat(failed.errorMessage()).contains("지연");
        assertThat(failed.review()).isNull();

        CodeReviewResponse retried = service.requestReview(JUDGMENT_ID, OWNER);
        assertThat(retried.status()).isEqualTo(CodeReviewStatus.COMPLETED);
        assertThat(retried.errorMessage()).isNull();
        assertThat(stored.get().getAttemptCount()).isEqualTo(2);
        verify(ragReviewClient, times(2)).generate(any());
    }

    @Test
    void unexpectedError_isStoredAsFailedWithGenericMessage() {
        givenJudgment(OWNER, true);
        when(ragReviewClient.generate(any())).thenThrow(new IllegalStateException("secret internal detail"));

        CodeReviewResponse response = service.requestReview(JUDGMENT_ID, OWNER);

        assertThat(response.status()).isEqualTo(CodeReviewStatus.FAILED);
        assertThat(response.errorMessage()).doesNotContain("secret internal detail");
    }

    @Test
    void lineRangeOutsideSubmittedCode_isFormatError() {
        givenJudgment(OWNER, true);
        // CODE는 4줄
        when(ragReviewClient.generate(any())).thenReturn(content(
                List.of(new CodeReviewContent.Improvement("bug", "없는 줄", 4, 5, "설명", null)), List.of()));

        CodeReviewResponse response = service.requestReview(JUDGMENT_ID, OWNER);

        assertThat(response.status()).isEqualTo(CodeReviewStatus.FAILED);
        assertThat(response.errorMessage()).contains("형식");
        assertThat(stored.get().getContentJson()).isNull();
    }

    @Test
    void moreThanThreeImprovementsOrUnknownKind_isFormatError() {
        CodeReviewContent.Improvement ok = new CodeReviewContent.Improvement("suggestion", "t", 1, 1, "d", null);
        CodeChallengeJudgment judgment = judgment(JUDGMENT_ID, OWNER, true, CODE);

        assertThatThrownBy(() -> service.validated(content(List.of(ok, ok, ok, ok), List.of()), judgment, CODE))
                .isInstanceOf(CodeReviewGenerationException.class);
        assertThatThrownBy(() -> service.validated(content(
                List.of(new CodeReviewContent.Improvement("style", "t", 1, 1, "d", null)), List.of()), judgment, CODE))
                .isInstanceOf(CodeReviewGenerationException.class);
        assertThat(service.validated(content(List.of(ok, ok, ok), List.of()), judgment, CODE).improvements()).hasSize(3);
    }

    @Test
    void lessonLinkOutsideStudyPages_isFormatError() {
        CodeChallengeJudgment judgment = judgment(JUDGMENT_ID, OWNER, true, CODE);

        for (String url : List.of("https://evil.example/study/x", "//evil.example/x", "/study//evil.example", "javascript:alert(1)")) {
            assertThatThrownBy(() -> service.validated(content(List.of(),
                    List.of(new CodeReviewContent.Lesson("c", "t", url))), judgment, CODE))
                    .as(url)
                    .isInstanceOf(CodeReviewGenerationException.class);
        }
    }

    @Test
    void lateResultOfReclaimedAttempt_doesNotOverwriteNewerAttempt() {
        givenJudgment(OWNER, true);
        when(ragReviewClient.generate(any())).thenAnswer(inv -> {
            // AI 호출 도중 이 요청이 멈춘 것으로 간주돼 다른 요청이 재시도를 선점(attempt 2)하고 완료함
            CodeReview review = stored.get();
            review.restart();
            review.complete("{\"summary\":\"newer\"}");
            return validContent();
        });

        CodeReviewResponse response = service.requestReview(JUDGMENT_ID, OWNER);

        assertThat(response.status()).isEqualTo(CodeReviewStatus.COMPLETED);
        assertThat(response.review().summary()).isEqualTo("newer");
    }

    @Test
    void getReview_withoutRequest_returnsEmptyStatus() {
        givenJudgment(OWNER, true);

        CodeReviewResponse response = service.getReview(JUDGMENT_ID, OWNER);

        assertThat(response.judgmentId()).isEqualTo(JUDGMENT_ID);
        assertThat(response.status()).isNull();
        assertThat(response.review()).isNull();
    }
}
