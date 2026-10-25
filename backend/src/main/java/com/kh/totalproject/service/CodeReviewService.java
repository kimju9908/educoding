package com.kh.totalproject.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kh.totalproject.constant.codereview.CodeReviewStatus;
import com.kh.totalproject.dto.request.RagReviewRequest;
import com.kh.totalproject.dto.response.CodeReviewContent;
import com.kh.totalproject.dto.response.CodeReviewResponse;
import com.kh.totalproject.dto.response.ReviewTargetResponse;
import com.kh.totalproject.entity.CodeChallenge;
import com.kh.totalproject.entity.CodeChallengeJudgment;
import com.kh.totalproject.entity.CodeReview;
import com.kh.totalproject.exception.CodeReviewException;
import com.kh.totalproject.exception.CodeReviewGenerationException;
import com.kh.totalproject.repository.CodeChallengeJudgmentRepository;
import com.kh.totalproject.repository.CodeReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

import java.nio.ByteBuffer;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Set;

/**
 * 정답 제출 1건에 대한 AI 코드 리뷰 생성·조회.
 *
 * - 대상 제출은 항상 judgmentId(또는 그 채점을 만든 jobId)로 정확히 지정된다. 최신 제출로 대체하지 않는다.
 * - 소유권과 passed=true는 여기서 DB 값으로 확인한다. RAG 서비스에 보내는 내용도 전부 DB 값이다.
 * - 외부 AI 호출 동안에는 트랜잭션을 잡지 않는다: [짧은 tx: PENDING 선점] → [tx 없음: RAG 호출] → [짧은 tx: 결과 저장].
 * - 중복 클릭·동시 요청: 새 리뷰는 (judgment_id, review_version) 유니크 제약, FAILED 재시도는 @Version 낙관적 락으로
 *   한 요청만 선점하고, 나머지는 현재 상태(PENDING)를 그대로 돌려받는다.
 */
@RequiredArgsConstructor
@Service
@Slf4j
public class CodeReviewService {
    // 리뷰 형식(프롬프트·응답 구조)이 바뀌면 올린다 -- 기존 버전 리뷰는 그대로 남고 새 버전으로 다시 생성된다.
    public static final int REVIEW_VERSION = 1;
    // 이 시간보다 오래 PENDING이면 생성 요청이 중간에 죽은 것으로 보고 재시도를 허용한다
    // (RagReviewClient 읽기 타임아웃 180초보다 길게).
    static final long STALE_PENDING_SECONDS = 300;
    // rag/service/review_graph.py의 MAX_CODE_CHARS와 같은 값
    static final int MAX_CODE_CHARS = 20000;
    static final int MAX_IMPROVEMENTS = 3;
    private static final int MAX_JOB_ID_LENGTH = 64;
    private static final int MAX_ERROR_MESSAGE_LENGTH = 500;
    private static final Set<String> IMPROVEMENT_KINDS = Set.of("suggestion", "bug");

    private final CodeChallengeJudgmentRepository judgmentRepository;
    private final CodeReviewRepository codeReviewRepository;
    private final RagReviewClient ragReviewClient;
    private final TransactionTemplate transactionTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // 선점에 성공하면 request/claimedAttempt가, 이미 처리 중·완료면 existing이 채워진다
    private record Claim(CodeReviewResponse existing, Long reviewId, int claimedAttempt,
                         RagReviewRequest request, CodeChallengeJudgment judgment, String code) {}

    /** SSE로 받은 jobId → 방금 채점된 제출. 웹훅 저장이 SSE보다 늦을 수 있어 404면 클라이언트가 잠시 후 다시 묻는다. */
    public ReviewTargetResponse findTargetByJob(String jobId, Long userKey) {
        if (jobId == null || jobId.isBlank() || jobId.length() > MAX_JOB_ID_LENGTH) {
            throw new CodeReviewException(HttpStatus.BAD_REQUEST, "잘못된 채점 작업 ID입니다.");
        }
        return transactionTemplate.execute(status -> {
            CodeChallengeJudgment judgment = judgmentRepository.findFirstByJobIdOrderByJudgmentIdDesc(jobId)
                    .orElseThrow(() -> new CodeReviewException(HttpStatus.NOT_FOUND, "채점 결과를 아직 찾을 수 없습니다."));
            checkOwner(judgment, userKey);
            return new ReviewTargetResponse(judgment.getJudgmentId(),
                    judgment.getCodeChallenge().getChallengeId(), Boolean.TRUE.equals(judgment.getPassed()));
        });
    }

    /** 저장된 리뷰 조회. 아직 요청한 적 없으면 status=null. */
    public CodeReviewResponse getReview(Long judgmentId, Long userKey) {
        return transactionTemplate.execute(status -> {
            CodeChallengeJudgment judgment = loadOwnedJudgment(judgmentId, userKey);
            checkPassed(judgment);
            return codeReviewRepository.findByJudgment_JudgmentIdAndReviewVersion(judgmentId, REVIEW_VERSION)
                    .map(this::toResponse)
                    .orElseGet(() -> new CodeReviewResponse(judgmentId, REVIEW_VERSION, null, null, null));
        });
    }

    /**
     * 리뷰 생성 요청. 이미 완료된 리뷰가 있으면 그대로 돌려주고(재생성 X), 다른 요청이 생성 중이면 PENDING을 돌려준다.
     * 생성은 이 요청 스레드에서 끝까지 진행되고 COMPLETED 또는 FAILED로 저장된 결과를 돌려준다.
     */
    public CodeReviewResponse requestReview(Long judgmentId, Long userKey) {
        Claim claim;
        try {
            claim = transactionTemplate.execute(status -> claim(judgmentId, userKey));
        }
        catch (DataIntegrityViolationException | OptimisticLockingFailureException e) {
            // 동시에 들어온 다른 요청이 먼저 선점함 -- 그 요청의 상태를 그대로 보여준다
            log.info("Code review for judgment {} already claimed by a concurrent request", judgmentId);
            return getReview(judgmentId, userKey);
        }
        if (claim.existing() != null) {
            return claim.existing();
        }

        // 트랜잭션 밖에서 외부 AI 호출
        String contentJson = null;
        String errorMessage = null;
        try {
            CodeReviewContent content = ragReviewClient.generate(claim.request());
            contentJson = objectMapper.writeValueAsString(validated(content, claim.judgment(), claim.code()));
        }
        catch (CodeReviewGenerationException e) {
            errorMessage = e.getMessage();
        }
        catch (JsonProcessingException e) {
            log.error("Failed to serialize code review for judgment {}", judgmentId, e);
            errorMessage = "AI 코드 리뷰를 저장하지 못했습니다. 다시 시도해주세요.";
        }
        catch (RuntimeException e) {
            log.error("Unexpected error while generating code review for judgment {}", judgmentId, e);
            errorMessage = "AI 코드 리뷰를 생성하지 못했습니다. 잠시 후 다시 시도해주세요.";
        }

        String finalContentJson = contentJson;
        String finalErrorMessage = errorMessage;
        return transactionTemplate.execute(status -> finish(claim, finalContentJson, finalErrorMessage));
    }

    private Claim claim(Long judgmentId, Long userKey) {
        CodeChallengeJudgment judgment = loadOwnedJudgment(judgmentId, userKey);
        checkPassed(judgment);
        String code = decodeCode(judgment.getCode());
        if (code.isBlank()) {
            throw new CodeReviewException(HttpStatus.UNPROCESSABLE_ENTITY, "리뷰할 코드가 없습니다.");
        }
        if (code.length() > MAX_CODE_CHARS) {
            throw new CodeReviewException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "코드가 너무 길어 AI 코드 리뷰를 할 수 없습니다. (최대 " + MAX_CODE_CHARS + "자)");
        }

        CodeReview review = codeReviewRepository.findByJudgment_JudgmentIdAndReviewVersion(judgmentId, REVIEW_VERSION)
                .orElse(null);
        if (review == null) {
            review = codeReviewRepository.saveAndFlush(CodeReview.builder()
                    .user(judgment.getUser())
                    .judgment(judgment)
                    .reviewVersion(REVIEW_VERSION)
                    .build());
        }
        else if (review.getStatus() == CodeReviewStatus.COMPLETED || isFreshPending(review)) {
            return new Claim(toResponse(review), null, 0, null, null, null);
        }
        else {
            // FAILED, 또는 생성 도중 멈춘 오래된 PENDING → 재시도
            review.restart();
            review = codeReviewRepository.saveAndFlush(review);
        }
        return new Claim(null, review.getReviewId(), review.getAttemptCount(), buildRequest(judgment, code), judgment, code);
    }

    private CodeReviewResponse finish(Claim claim, String contentJson, String errorMessage) {
        CodeReview review = codeReviewRepository.findById(claim.reviewId())
                .orElseThrow(() -> new CodeReviewException(HttpStatus.NOT_FOUND, "리뷰를 찾을 수 없습니다."));
        // 이 요청이 멈춘 것으로 간주돼 다른 요청이 재시도를 선점했으면, 그쪽 결과를 덮어쓰지 않는다
        if (review.getStatus() != CodeReviewStatus.PENDING || review.getAttemptCount() != claim.claimedAttempt()) {
            return toResponse(review);
        }
        if (contentJson != null) {
            review.complete(contentJson);
        }
        else {
            review.fail(truncate(errorMessage));
        }
        return toResponse(codeReviewRepository.saveAndFlush(review));
    }

    private boolean isFreshPending(CodeReview review) {
        return review.getStatus() == CodeReviewStatus.PENDING
                && review.getUpdatedAt() != null
                && review.getUpdatedAt().isAfter(LocalDateTime.now().minusSeconds(STALE_PENDING_SECONDS));
    }

    private CodeChallengeJudgment loadOwnedJudgment(Long judgmentId, Long userKey) {
        if (judgmentId == null) {
            throw new CodeReviewException(HttpStatus.BAD_REQUEST, "제출 ID가 필요합니다.");
        }
        CodeChallengeJudgment judgment = judgmentRepository.findById(judgmentId)
                .orElseThrow(() -> new CodeReviewException(HttpStatus.NOT_FOUND, "존재하지 않는 제출입니다."));
        checkOwner(judgment, userKey);
        return judgment;
    }

    private void checkOwner(CodeChallengeJudgment judgment, Long userKey) {
        if (userKey == null || !userKey.equals(judgment.getUser().getUserKey())) {
            throw new CodeReviewException(HttpStatus.FORBIDDEN, "본인의 제출만 리뷰를 볼 수 있습니다.");
        }
    }

    private void checkPassed(CodeChallengeJudgment judgment) {
        if (!Boolean.TRUE.equals(judgment.getPassed())) {
            throw new CodeReviewException(HttpStatus.CONFLICT, "정답 처리된 제출만 AI 코드 리뷰를 받을 수 있습니다.");
        }
    }

    // 문제 조건과 채점 성능 정보만 보낸다. 숨겨진 테스트 케이스·정답 코드는 엔티티에도, 요청 구조에도 없다.
    private RagReviewRequest buildRequest(CodeChallengeJudgment judgment, String code) {
        CodeChallenge challenge = judgment.getCodeChallenge();
        return new RagReviewRequest(
                new RagReviewRequest.Submission(
                        judgment.getJudgmentId(),
                        judgment.getCodeLanguage().name(),
                        code,
                        judgment.getMaxElapsedTimeMs(),
                        judgment.getMaxMemoryUsageMb()
                ),
                new RagReviewRequest.Challenge(
                        challenge.getChallengeId(),
                        challenge.getTitle(),
                        challenge.getDescription(),
                        challenge.getCond(),
                        challenge.getCategory(),
                        challenge.getDifficulty() == null ? null : challenge.getDifficulty().name(),
                        challenge.getTimeLimitMs(),
                        challenge.getMemoryLimitMb()
                )
        );
    }

    /**
     * RAG 서비스도 같은 검증을 하지만, 저장 전에 한 번 더 확인한다 (서비스 간 계약이 어긋나도 잘못된 리뷰를 저장하지 않도록).
     * 관측값(실행 시간·메모리)은 모델 응답이 아니라 DB의 채점 값으로 덮어쓴다.
     */
    CodeReviewContent validated(CodeReviewContent content, CodeChallengeJudgment judgment, String code) {
        if (content == null || isBlank(content.summary())
                || content.strengths() == null || content.strengths().isEmpty()
                || content.strengths().stream().anyMatch(CodeReviewService::isBlank)
                || content.complexity() == null
                || isBlank(content.complexity().time()) || isBlank(content.complexity().space())) {
            throw new CodeReviewGenerationException("AI 응답 형식이 올바르지 않습니다. 다시 시도해주세요.");
        }

        long lineCount = code.lines().count();
        List<CodeReviewContent.Improvement> improvements = content.improvements() == null ? List.of() : content.improvements();
        if (improvements.size() > MAX_IMPROVEMENTS) {
            throw new CodeReviewGenerationException("AI 응답 형식이 올바르지 않습니다. 다시 시도해주세요.");
        }
        for (CodeReviewContent.Improvement improvement : improvements) {
            if (improvement == null || !IMPROVEMENT_KINDS.contains(improvement.kind())
                    || isBlank(improvement.title()) || isBlank(improvement.detail())
                    || improvement.lineStart() == null || improvement.lineEnd() == null
                    || improvement.lineStart() < 1 || improvement.lineStart() > improvement.lineEnd()
                    || improvement.lineEnd() > lineCount) {
                throw new CodeReviewGenerationException("AI 응답 형식이 올바르지 않습니다. 다시 시도해주세요.");
            }
        }

        List<CodeReviewContent.Lesson> lessons = content.lessons() == null ? List.of() : content.lessons();
        for (CodeReviewContent.Lesson lesson : lessons) {
            // 앱 내부 학습 페이지 경로만 허용 (외부 링크·만들어낸 URL 차단)
            if (lesson == null || isBlank(lesson.title()) || lesson.url() == null
                    || !lesson.url().startsWith("/study/") || lesson.url().contains("//")) {
                throw new CodeReviewGenerationException("AI 응답 형식이 올바르지 않습니다. 다시 시도해주세요.");
            }
        }

        return new CodeReviewContent(
                content.summary(),
                content.strengths(),
                content.complexity(),
                new CodeReviewContent.ObservedMetrics(judgment.getMaxElapsedTimeMs(), judgment.getMaxMemoryUsageMb()),
                improvements,
                lessons
        );
    }

    // 제출 코드는 프론트엔드가 Base64로 인코딩해 보낸 그대로 저장돼 있다 (judge도 b64decode(validate=True)로 받음).
    // AI에는 사람이 읽는 원문을 보내야 하고, 줄 번호 검증도 원문 기준이어야 한다.
    // public: AutoCommitJobRunner(com.kh.totalproject.github)도 같은 저장 인코딩을 복원해야 해서 재사용한다
    // (docs/github-auto-commit.md section 4) -- 로직을 따로 베끼지 않기 위함.
    public static String decodeCode(String stored) {
        if (stored == null) {
            return "";
        }
        try {
            byte[] bytes = Base64.getDecoder().decode(stored.strip());
            return StandardCharsets.UTF_8.newDecoder()
                    .onMalformedInput(CodingErrorAction.REPORT)
                    .onUnmappableCharacter(CodingErrorAction.REPORT)
                    .decode(ByteBuffer.wrap(bytes))
                    .toString();
        }
        catch (IllegalArgumentException | CharacterCodingException e) {
            throw new CodeReviewException(HttpStatus.UNPROCESSABLE_ENTITY, "제출 코드를 읽을 수 없어 리뷰할 수 없습니다.");
        }
    }

    private CodeReviewResponse toResponse(CodeReview review) {
        CodeReviewContent content = null;
        if (review.getStatus() == CodeReviewStatus.COMPLETED && review.getContentJson() != null) {
            try {
                content = objectMapper.readValue(review.getContentJson(), CodeReviewContent.class);
            }
            catch (JsonProcessingException e) {
                log.warn("Stored code review {} has unreadable content: {}", review.getReviewId(), e.getMessage());
            }
        }
        return new CodeReviewResponse(review.getJudgment().getJudgmentId(), review.getReviewVersion(),
                review.getStatus(), content, review.getErrorMessage());
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private static String truncate(String message) {
        if (message == null) {
            return "AI 코드 리뷰를 생성하지 못했습니다.";
        }
        return message.length() > MAX_ERROR_MESSAGE_LENGTH ? message.substring(0, MAX_ERROR_MESSAGE_LENGTH) : message;
    }
}
