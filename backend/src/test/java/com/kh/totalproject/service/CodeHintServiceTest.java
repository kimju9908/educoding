package com.kh.totalproject.service;

import com.kh.totalproject.constant.codechallenge.enums.CodeChallengeDifficulty;
import com.kh.totalproject.constant.codechallenge.enums.CodeChallengeLanguage;
import com.kh.totalproject.constant.codechallenge.enums.FailureCause;
import com.kh.totalproject.constant.codehint.CodeHintStatus;
import com.kh.totalproject.dto.request.CodeHintRequest;
import com.kh.totalproject.dto.request.RagHintRequest;
import com.kh.totalproject.dto.response.CodeHintContent;
import com.kh.totalproject.dto.response.CodeHintStateResponse;
import com.kh.totalproject.dto.response.CodeReviewContent;
import com.kh.totalproject.entity.CodeChallenge;
import com.kh.totalproject.entity.CodeChallengeJudgment;
import com.kh.totalproject.entity.CodeHint;
import com.kh.totalproject.entity.CodeHintAttempt;
import com.kh.totalproject.entity.User;
import com.kh.totalproject.exception.CodeReviewException;
import com.kh.totalproject.exception.CodeReviewGenerationException;
import com.kh.totalproject.repository.CodeChallengeJudgmentRepository;
import com.kh.totalproject.repository.CodeChallengeRepository;
import com.kh.totalproject.repository.CodeHintAttemptRepository;
import com.kh.totalproject.repository.CodeHintRepository;
import com.kh.totalproject.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * CodeHintService의 서버 측 공개 단계 결정·권한 확인·상태 전이·중복 방지를 검증합니다.
 * RAG 호출(RagHintClient)과 리포지토리는 모의 객체이며, code_hint_attempt / code_hint 테이블은 메모리 컬렉션으로 흉내 냅니다.
 * 여기서는 "서버가 어떤 단계·어떤 맥락을 허용하는가"만 다룹니다. 모델이 그 단계 범위 안의 내용을 쓰는지는
 * 모의 테스트로 보장할 수 없으며, 대표 문제로 실제 모델을 돌린 평가를 따로 봅니다.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class CodeHintServiceTest {

    private static final long OWNER = 1L;
    private static final long OTHER_USER = 2L;
    private static final long CHALLENGE_ID = 7L;
    private static final long JUDGMENT_ID = 100L;
    private static final String CODE = "n = int(input())\nprint(n * 2)\n";

    @Mock private CodeChallengeRepository challengeRepository;
    @Mock private CodeChallengeJudgmentRepository judgmentRepository;
    @Mock private CodeHintAttemptRepository attemptRepository;
    @Mock private CodeHintRepository hintRepository;
    @Mock private UserRepository userRepository;
    @Mock private RagHintClient ragHintClient;

    private CodeHintService service;
    private final Map<Long, CodeHintAttempt> attempts = new LinkedHashMap<>();
    private final List<CodeHint> hints = new ArrayList<>();
    private final AtomicLong ids = new AtomicLong(1000);

    private static class ImmediateTransactionTemplate extends TransactionTemplate {
        @Override
        public <T> T execute(TransactionCallback<T> action) {
            return action.doInTransaction((TransactionStatus) null);
        }
    }

    @BeforeEach
    void setUp() {
        service = new CodeHintService(challengeRepository, judgmentRepository, attemptRepository, hintRepository,
                userRepository, ragHintClient, new ImmediateTransactionTemplate());

        when(challengeRepository.findById(CHALLENGE_ID)).thenReturn(Optional.of(challenge(CHALLENGE_ID)));
        when(userRepository.getReferenceById(anyLong())).thenAnswer(inv -> user(inv.getArgument(0)));

        when(attemptRepository.findByUser_UserKeyAndCodeChallenge_ChallengeIdAndAttemptKeyAndHintVersion(
                anyLong(), anyLong(), anyString(), eq(CodeHintService.HINT_VERSION)))
                .thenAnswer(inv -> attempts.values().stream()
                        .filter(a -> a.getUser().getUserKey().equals(inv.getArgument(0))
                                && a.getCodeChallenge().getChallengeId().equals(inv.getArgument(1))
                                && a.getAttemptKey().equals(inv.getArgument(2)))
                        .findFirst());
        when(attemptRepository.findById(anyLong())).thenAnswer(inv -> Optional.ofNullable(attempts.get((Long) inv.getArgument(0))));
        when(attemptRepository.saveAndFlush(any(CodeHintAttempt.class))).thenAnswer(inv -> {
            CodeHintAttempt attempt = inv.getArgument(0);
            if (attempt.getHintAttemptId() == null) {
                ReflectionTestUtils.setField(attempt, "hintAttemptId", ids.incrementAndGet());
            }
            attempts.put(attempt.getHintAttemptId(), attempt);
            return attempt;
        });
        when(hintRepository.findByAttempt_HintAttemptIdOrderByLevelAsc(anyLong())).thenAnswer(inv -> hints.stream()
                .filter(h -> h.getAttempt().getHintAttemptId().equals(inv.getArgument(0)))
                .sorted(Comparator.comparing(CodeHint::getLevel))
                .toList());
        when(hintRepository.saveAndFlush(any(CodeHint.class))).thenAnswer(inv -> {
            CodeHint hint = inv.getArgument(0);
            // (hint_attempt_id, level) 유니크 제약
            boolean duplicate = hints.stream().anyMatch(h -> h.getAttempt() == hint.getAttempt() && h.getLevel().equals(hint.getLevel()));
            if (duplicate) {
                throw new DataIntegrityViolationException("uk_code_hint_attempt_level");
            }
            ReflectionTestUtils.setField(hint, "hintId", ids.incrementAndGet());
            hints.add(hint);
            return hint;
        });
        // 테스트에서 when(...)으로 다시 스텁할 때 인자 없이 한 번 호출되므로 null을 견디게 한다
        when(ragHintClient.generate(any())).thenAnswer(inv -> {
            RagHintRequest request = inv.getArgument(0);
            return request == null ? null : hintFor(request.level());
        });
    }

    // ---------- fixtures ----------

    private static User user(long userKey) {
        User user = new User();
        user.setUserKey(userKey);
        return user;
    }

    private static CodeChallenge challenge(long id) {
        CodeChallenge challenge = new CodeChallenge();
        challenge.setChallengeId(id);
        challenge.setTitle("두 배 출력");
        challenge.setDescription("N을 입력받아 N의 세 배를 출력하세요.");
        challenge.setCond("1 <= N <= 1000");
        challenge.setCategory("수학");
        challenge.setDifficulty(CodeChallengeDifficulty.values()[0]);
        challenge.setTimeLimitMs(1000);
        challenge.setMemoryLimitMb(128f);
        return challenge;
    }

    private static CodeChallengeJudgment judgment(long id, long ownerKey, long challengeId, boolean passed,
                                                  FailureCause cause, String detail) {
        String stored = Base64.getEncoder().encodeToString(CODE.getBytes(StandardCharsets.UTF_8));
        CodeChallengeJudgment judgment = CodeChallengeJudgment.builder()
                .user(user(ownerKey))
                .codeChallenge(challenge(challengeId))
                .passed(passed)
                .codeLanguage(CodeChallengeLanguage.PYTHON3)
                .code(stored)
                .codeByteSize(stored.length())
                .submittedAt(LocalDateTime.now())
                .failureCause(passed ? null : cause)
                .failureDetail(passed ? null : detail)
                .jobId("job-" + id)
                .build();
        ReflectionTestUtils.setField(judgment, "judgmentId", id);
        return judgment;
    }

    private CodeChallengeJudgment givenFailedJudgment(long id, FailureCause cause, String detail) {
        CodeChallengeJudgment judgment = judgment(id, OWNER, CHALLENGE_ID, false, cause, detail);
        when(judgmentRepository.findById(id)).thenReturn(Optional.of(judgment));
        return judgment;
    }

    private static final CodeReviewContent.Lesson LESSON =
            new CodeReviewContent.Lesson("python-02-03-01", "03. 연산자 - 산술 연산자", "/study/python/02/03?headingIndex=4");

    private static CodeHintContent hintFor(int level) {
        return switch (level) {
            case 1 -> new CodeHintContent(1, "곱셈 연산을 떠올려 보세요.", List.of("산술 연산"),
                    List.of("문제에서 몇 배를 출력하라고 했나요?"), null, List.of(), List.of(), null, null, List.of(LESSON));
            case 2 -> new CodeHintContent(2, "입력 하나로 계산이 끝납니다.", List.of(), List.of(),
                    "정수 하나를 읽어 배수를 계산합니다.", List.of(new CodeHintContent.DataStructure("정수 변수", "값이 하나뿐")),
                    List.of(), null, null, List.of());
            default -> new CodeHintContent(3, "읽기 → 계산 → 출력", List.of(), List.of(), null, List.of(),
                    List.of("정수를 읽는다", "배수를 계산해 출력한다"), "n ← 입력\n결과 ← n × 배수\n결과 출력", null, List.of());
        };
    }

    private static CodeHintRequest presubmit(int level) {
        return new CodeHintRequest(CHALLENGE_ID, null, level, "PYTHON3", null);
    }

    private static CodeHintRequest forJudgment(long judgmentId, int level) {
        return new CodeHintRequest(CHALLENGE_ID, judgmentId, level, null, null);
    }

    private static HttpStatus statusOf(Throwable e) {
        return ((CodeReviewException) e).getStatus();
    }

    private RagHintRequest lastRagRequest(int expectedCalls) {
        ArgumentCaptor<RagHintRequest> captor = ArgumentCaptor.forClass(RagHintRequest.class);
        verify(ragHintClient, times(expectedCalls)).generate(captor.capture());
        return captor.getValue();
    }

    // ---------- 제출 전 / 오답 제출 후 생성 ----------

    @Test
    void presubmitLevel1_isGeneratedFromChallengeOnlyAndStored() {
        CodeHintStateResponse state = service.requestHint(presubmit(1), OWNER);

        assertThat(state.revealedLevel()).isEqualTo(1);
        assertThat(state.status()).isEqualTo(CodeHintStatus.READY);
        assertThat(state.judgmentId()).isNull();
        assertThat(state.hints()).hasSize(1);
        CodeHintStateResponse.Item item = state.hints().get(0);
        assertThat(item.content().concepts()).containsExactly("산술 연산");
        assertThat(item.revealedAt()).isNotNull();
        assertThat(item.content().lessons()).containsExactly(LESSON);  // 관련 강의 출처 링크 유지

        RagHintRequest sent = lastRagRequest(1);
        assertThat(sent.level()).isEqualTo(1);
        assertThat(sent.submission()).isNull();
        assertThat(sent.revealedHints()).isEmpty();
        assertThat(sent.language()).isEqualTo("PYTHON3");
        assertThat(sent.challenge().challengeId()).isEqualTo(CHALLENGE_ID);
    }

    @Test
    void afterWrongSubmission_sendsThatSubmissionWithFailureSummaryAndLinksHintToIt() {
        givenFailedJudgment(JUDGMENT_ID, FailureCause.WRONG_ANSWER, null);

        CodeHintStateResponse state = service.requestHint(forJudgment(JUDGMENT_ID, 1), OWNER);

        assertThat(state.judgmentId()).isEqualTo(JUDGMENT_ID);
        assertThat(state.hints().get(0).judgmentId()).isEqualTo(JUDGMENT_ID);
        RagHintRequest sent = lastRagRequest(1);
        assertThat(sent.submission().submissionId()).isEqualTo(JUDGMENT_ID);
        assertThat(sent.submission().code()).isEqualTo(CODE);  // Base64 디코딩된 원문
        assertThat(sent.submission().failureCause()).isEqualTo("WRONG_ANSWER");
        assertThat(sent.submission().failureSummary()).contains("입력과 기대 출력은 제공되지 않습니다");
        assertThat(sent.language()).isNull();
    }

    // ---------- 1 → 2 → 3 진행과 재조회 ----------

    @Test
    void levelsProgressInOrder_andEachRequestCarriesOnlyLowerRevealedHints() {
        service.requestHint(presubmit(1), OWNER);
        service.requestHint(presubmit(2), OWNER);
        RagHintRequest level2 = lastRagRequest(2);
        assertThat(level2.level()).isEqualTo(2);
        assertThat(level2.revealedHints()).extracting(RagHintRequest.RevealedHint::level).containsExactly(1);
        assertThat(level2.revealedHints().get(0).text()).contains("곱셈 연산을 떠올려 보세요.").doesNotContain("/study/");

        CodeHintStateResponse state = service.requestHint(presubmit(3), OWNER);
        RagHintRequest level3 = lastRagRequest(3);
        assertThat(level3.revealedHints()).extracting(RagHintRequest.RevealedHint::level).containsExactly(1, 2);

        assertThat(state.revealedLevel()).isEqualTo(3);
        assertThat(state.hints()).extracting(CodeHintStateResponse.Item::level).containsExactly(1, 2, 3);
        assertThat(state.hints().get(2).content().pseudocode()).contains("결과 출력");
    }

    @Test
    void alreadyRevealedLevel_isReturnedFromStorageWithoutCallingAi() {
        service.requestHint(presubmit(1), OWNER);
        service.requestHint(presubmit(2), OWNER);

        CodeHintStateResponse again = service.requestHint(presubmit(1), OWNER);
        CodeHintStateResponse viewed = service.getState(CHALLENGE_ID, null, OWNER);

        verify(ragHintClient, times(2)).generate(any());
        assertThat(again.revealedLevel()).isEqualTo(2);
        assertThat(viewed.hints()).extracting(CodeHintStateResponse.Item::level).containsExactly(1, 2);
        assertThat(hints).hasSize(2);
    }

    @Test
    void getState_beforeAnyRequest_isEmpty() {
        CodeHintStateResponse state = service.getState(CHALLENGE_ID, null, OWNER);
        assertThat(state.attemptId()).isNull();
        assertThat(state.revealedLevel()).isZero();
        assertThat(state.hints()).isEmpty();
    }

    // ---------- 단계 건너뛰기·잘못된 요청 거절 ----------

    @Test
    void skippingALevel_isRejectedWithoutCallingAi() {
        service.requestHint(presubmit(1), OWNER);

        assertThatThrownBy(() -> service.requestHint(presubmit(3), OWNER))
                .isInstanceOf(CodeReviewException.class)
                .satisfies(e -> assertThat(statusOf(e)).isEqualTo(HttpStatus.CONFLICT));
        assertThatThrownBy(() -> service.requestHint(presubmit(2), OTHER_USER))  // 다른 사용자의 진행은 공유되지 않음
                .satisfies(e -> assertThat(statusOf(e)).isEqualTo(HttpStatus.CONFLICT));
        verify(ragHintClient, times(1)).generate(any());
    }

    @Test
    void invalidLevelQuestionOrLanguage_isBadRequest() {
        for (CodeHintRequest bad : List.of(
                presubmit(0), presubmit(4), new CodeHintRequest(CHALLENGE_ID, null, null, null, null),
                new CodeHintRequest(CHALLENGE_ID, null, 1, null, "가".repeat(301)),
                new CodeHintRequest(CHALLENGE_ID, null, 1, "RUBY", null),
                new CodeHintRequest(null, null, 1, null, null))) {
            assertThatThrownBy(() -> service.requestHint(bad, OWNER))
                    .satisfies(e -> assertThat(statusOf(e)).isEqualTo(HttpStatus.BAD_REQUEST));
        }
        verify(ragHintClient, never()).generate(any());
    }

    // ---------- 제출 소유권·문제 일치·오답 여부 ----------

    @Test
    void otherUsersSubmission_isForbiddenWithoutCallingAi() {
        when(judgmentRepository.findById(JUDGMENT_ID))
                .thenReturn(Optional.of(judgment(JUDGMENT_ID, OTHER_USER, CHALLENGE_ID, false, FailureCause.WRONG_ANSWER, null)));

        assertThatThrownBy(() -> service.requestHint(forJudgment(JUDGMENT_ID, 1), OWNER))
                .satisfies(e -> assertThat(statusOf(e)).isEqualTo(HttpStatus.FORBIDDEN));
        assertThatThrownBy(() -> service.getState(CHALLENGE_ID, JUDGMENT_ID, OWNER))
                .satisfies(e -> assertThat(statusOf(e)).isEqualTo(HttpStatus.FORBIDDEN));
        verify(ragHintClient, never()).generate(any());
        assertThat(attempts).isEmpty();
    }

    @Test
    void submissionOfAnotherChallenge_isRejected() {
        when(judgmentRepository.findById(JUDGMENT_ID))
                .thenReturn(Optional.of(judgment(JUDGMENT_ID, OWNER, 99L, false, FailureCause.WRONG_ANSWER, null)));

        assertThatThrownBy(() -> service.requestHint(forJudgment(JUDGMENT_ID, 1), OWNER))
                .satisfies(e -> assertThat(statusOf(e)).isEqualTo(HttpStatus.BAD_REQUEST));
        verify(ragHintClient, never()).generate(any());
    }

    @Test
    void passedSubmission_cannotBeAHintBasis() {
        when(judgmentRepository.findById(JUDGMENT_ID))
                .thenReturn(Optional.of(judgment(JUDGMENT_ID, OWNER, CHALLENGE_ID, true, null, null)));

        assertThatThrownBy(() -> service.requestHint(forJudgment(JUDGMENT_ID, 1), OWNER))
                .satisfies(e -> assertThat(statusOf(e)).isEqualTo(HttpStatus.CONFLICT));
    }

    // ---------- 생성 실패·중복·동시 요청 ----------

    @Test
    void generationFailure_doesNotConsumeTheLevel_andRetrySucceeds() {
        when(ragHintClient.generate(any()))
                .thenThrow(new CodeReviewGenerationException("AI 응답이 지연되었습니다. 잠시 후 다시 시도해주세요."))
                .thenAnswer(inv -> hintFor(1));

        CodeHintStateResponse failed = service.requestHint(presubmit(1), OWNER);
        assertThat(failed.status()).isEqualTo(CodeHintStatus.FAILED);
        assertThat(failed.revealedLevel()).isZero();
        assertThat(failed.pendingLevel()).isEqualTo(1);
        assertThat(failed.errorMessage()).contains("지연");
        assertThat(hints).isEmpty();

        // 실패 후 2단계로 건너뛸 수도 없다
        assertThatThrownBy(() -> service.requestHint(presubmit(2), OWNER))
                .satisfies(e -> assertThat(statusOf(e)).isEqualTo(HttpStatus.CONFLICT));

        CodeHintStateResponse retried = service.requestHint(presubmit(1), OWNER);
        assertThat(retried.status()).isEqualTo(CodeHintStatus.READY);
        assertThat(retried.revealedLevel()).isEqualTo(1);
        assertThat(retried.errorMessage()).isNull();
    }

    @Test
    void responseWithHigherLevelFields_isStoredAsFailureNotRevealed() {
        // 1단계 요청인데 3단계 필드(의사코드)가 섞여 옴
        when(ragHintClient.generate(any())).thenReturn(new CodeHintContent(1, "요약", List.of("개념"), List.of("질문"),
                null, List.of(), List.of(), "결과 ← n × 3", null, List.of()));

        CodeHintStateResponse state = service.requestHint(presubmit(1), OWNER);

        assertThat(state.status()).isEqualTo(CodeHintStatus.FAILED);
        assertThat(state.revealedLevel()).isZero();
        assertThat(hints).isEmpty();
    }

    @Test
    void wrongLevelExternalLinkOrInsightWithoutSubmission_areFormatErrors() {
        CodeHintContent level2AsLevel1 = hintFor(2);
        CodeHintContent externalLink = new CodeHintContent(1, "s", List.of("c"), List.of("q"), null, List.of(), List.of(),
                null, null, List.of(new CodeReviewContent.Lesson("x", "t", "https://evil.example/study/")));
        CodeHintContent insightWithoutSubmission = new CodeHintContent(1, "s", List.of("c"), List.of("q"), null,
                List.of(), List.of(), null, new CodeHintContent.FailureInsight("추정", true), List.of());
        CodeHintContent fencedCode = new CodeHintContent(3, "s", List.of(), List.of(), null, List.of(),
                List.of("a", "b"), "```python\nprint(n*3)\n```", null, List.of());

        assertThatThrownBy(() -> service.validated(level2AsLevel1, 1, false)).isInstanceOf(CodeReviewGenerationException.class);
        assertThatThrownBy(() -> service.validated(externalLink, 1, false)).isInstanceOf(CodeReviewGenerationException.class);
        assertThatThrownBy(() -> service.validated(insightWithoutSubmission, 1, false)).isInstanceOf(CodeReviewGenerationException.class);
        assertThatThrownBy(() -> service.validated(fencedCode, 3, false)).isInstanceOf(CodeReviewGenerationException.class);
        assertThat(service.validated(insightWithoutSubmission, 1, true).failureInsight().speculative()).isTrue();
    }

    @Test
    void duplicateClickWhileGenerating_returnsGeneratingWithoutSecondCall() {
        when(ragHintClient.generate(any())).thenAnswer(inv -> {
            // 생성 도중 같은 단계를 한 번 더 누름
            CodeHintStateResponse second = service.requestHint(presubmit(1), OWNER);
            assertThat(second.status()).isEqualTo(CodeHintStatus.GENERATING);
            assertThat(second.pendingLevel()).isEqualTo(1);
            // 생성 중에 다음 단계를 눌러도 건너뛰지 않음
            CodeHintStateResponse third = service.requestHint(presubmit(2), OWNER);
            assertThat(third.status()).isEqualTo(CodeHintStatus.GENERATING);
            return hintFor(1);
        });

        CodeHintStateResponse state = service.requestHint(presubmit(1), OWNER);

        verify(ragHintClient, times(1)).generate(any());
        assertThat(state.revealedLevel()).isEqualTo(1);
        assertThat(hints).hasSize(1);
    }

    @Test
    void concurrentClaimLosingTheRace_returnsWinnersState() {
        service.requestHint(presubmit(1), OWNER);
        when(attemptRepository.saveAndFlush(any(CodeHintAttempt.class)))
                .thenThrow(new OptimisticLockingFailureException("version changed"));

        CodeHintStateResponse state = service.requestHint(presubmit(2), OWNER);

        assertThat(state.revealedLevel()).isEqualTo(1);
        verify(ragHintClient, times(1)).generate(any());
    }

    @Test
    void concurrentFirstInsertLosingUniqueConstraint_returnsWinnersState() {
        when(attemptRepository.saveAndFlush(any(CodeHintAttempt.class)))
                .thenThrow(new DataIntegrityViolationException("uk_code_hint_attempt"));

        CodeHintStateResponse state = service.requestHint(presubmit(1), OWNER);

        assertThat(state.revealedLevel()).isZero();
        verify(ragHintClient, never()).generate(any());
    }

    @Test
    void staleGeneration_isReclaimed_andLateResultOfOldRequestIsDiscarded() {
        when(ragHintClient.generate(any())).thenAnswer(inv -> {
            // 이 요청이 멈춘 것으로 간주돼, 다른 요청이 같은 단계를 다시 선점하고 먼저 완료함
            CodeHintAttempt attempt = attempts.values().iterator().next();
            ReflectionTestUtils.setField(attempt, "generationStartedAt",
                    LocalDateTime.now().minusSeconds(CodeHintService.STALE_GENERATING_SECONDS + 1));
            doAnswer(inner -> new CodeHintContent(1, "newer", List.of("c"),
                    List.of("q"), null, List.of(), List.of(), null, null, List.of())).when(ragHintClient).generate(any());
            CodeHintStateResponse newer = service.requestHint(presubmit(1), OWNER);
            assertThat(newer.revealedLevel()).isEqualTo(1);
            return hintFor(1);  // 늦게 도착한 이전 요청의 결과
        });

        CodeHintStateResponse late = service.requestHint(presubmit(1), OWNER);

        assertThat(hints).hasSize(1);
        assertThat(late.hints().get(0).content().summary()).isEqualTo("newer");
    }

    // ---------- 새 풀이 시도 ----------

    @Test
    void newSubmissionIsANewAttempt_previousAttemptsKeepTheirHints() {
        givenFailedJudgment(JUDGMENT_ID, FailureCause.WRONG_ANSWER, null);
        givenFailedJudgment(JUDGMENT_ID + 1, FailureCause.RUNTIME_ERROR, "ZeroDivisionError");

        service.requestHint(presubmit(1), OWNER);
        service.requestHint(presubmit(2), OWNER);
        service.requestHint(forJudgment(JUDGMENT_ID, 1), OWNER);
        CodeHintStateResponse newest = service.requestHint(forJudgment(JUDGMENT_ID + 1, 1), OWNER);

        assertThat(attempts).hasSize(3);
        assertThat(newest.revealedLevel()).isEqualTo(1);
        assertThat(newest.judgmentId()).isEqualTo(JUDGMENT_ID + 1);
        // 새 시도의 1단계 생성에는 다른 시도의 힌트가 섞이지 않음
        assertThat(lastRagRequest(4).revealedHints()).isEmpty();
        assertThat(service.getState(CHALLENGE_ID, null, OWNER).revealedLevel()).isEqualTo(2);
        assertThat(service.getState(CHALLENGE_ID, JUDGMENT_ID, OWNER).revealedLevel()).isEqualTo(1);
    }

    // ---------- 실패 정보 축약 (민감 정보) ----------

    @Test
    void runtimeStderr_isReducedToErrorTypeAndLineNumbers() {
        String stderr = "debug: hidden input was 98765 42\n"
                + "Traceback (most recent call last):\n"
                + "  File \"/tmp/tmpab12/main.py\", line 2, in <module>\n"
                + "    print(n * 2)\n"
                + "ValueError: invalid literal for int() with base 10: 'SECRET_HIDDEN_INPUT'\n";

        String summary = CodeHintService.summarizeFailure(FailureCause.RUNTIME_ERROR, stderr, CODE);

        assertThat(summary).contains("ValueError").contains("[2]");
        assertThat(summary).doesNotContain("SECRET_HIDDEN_INPUT").doesNotContain("98765").doesNotContain("/tmp");
    }

    @Test
    void runtimeLineNumbersOutsideTheCode_andJavaStackFramesAreHandled() {
        String stderr = "Exception in thread \"main\" java.lang.ArrayIndexOutOfBoundsException: Index 5 out of bounds\n"
                + "\tat Main.main(Main.java:2)\n\tat java.base/Some.call(Some.java:999)\n";

        String summary = CodeHintService.summarizeFailure(FailureCause.RUNTIME_ERROR, stderr, CODE);

        assertThat(summary).contains("ArrayIndexOutOfBoundsException").contains("[2]").doesNotContain("999")
                .doesNotContain("Index 5");
    }

    @Test
    void compileErrorKeepsCompilerOutputWithoutSandboxPaths_timeoutsKeepOnlyTheCause() {
        String compile = CodeHintService.summarizeFailure(FailureCause.COMPILE_ERROR,
                "/tmp/tmpzz/Main.java:3: error: ';' expected", CODE);
        assertThat(compile).contains("Main.java:3: error: ';' expected").doesNotContain("/tmp");

        assertThat(CodeHintService.summarizeFailure(FailureCause.RUNTIME_TIMEOUT, "최대 실행 시간 제한을 초과하였습니다", CODE))
                .isEqualTo("실행 시간 제한 초과.");
    }

    @Test
    void failedSubmissionsList_isScopedToTheUserAndChallenge() {
        when(judgmentRepository.findTop10ByUser_UserKeyAndCodeChallenge_ChallengeIdAndPassedFalseOrderByJudgmentIdDesc(OWNER, CHALLENGE_ID))
                .thenReturn(List.of(judgment(JUDGMENT_ID, OWNER, CHALLENGE_ID, false, FailureCause.WRONG_ANSWER, null)));

        assertThat(service.listFailedSubmissions(CHALLENGE_ID, OWNER))
                .singleElement()
                .satisfies(s -> {
                    assertThat(s.judgmentId()).isEqualTo(JUDGMENT_ID);
                    assertThat(s.failureCause()).isEqualTo("WRONG_ANSWER");
                });
    }
}
