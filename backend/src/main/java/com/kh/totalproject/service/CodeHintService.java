package com.kh.totalproject.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kh.totalproject.constant.codechallenge.enums.CodeChallengeLanguage;
import com.kh.totalproject.constant.codechallenge.enums.FailureCause;
import com.kh.totalproject.constant.codehint.CodeHintStatus;
import com.kh.totalproject.dto.request.CodeHintRequest;
import com.kh.totalproject.dto.request.RagHintRequest;
import com.kh.totalproject.dto.request.RagReviewRequest;
import com.kh.totalproject.dto.response.CodeHintContent;
import com.kh.totalproject.dto.response.CodeHintStateResponse;
import com.kh.totalproject.dto.response.CodeReviewContent;
import com.kh.totalproject.dto.response.HintSubmissionResponse;
import com.kh.totalproject.entity.CodeChallenge;
import com.kh.totalproject.entity.CodeChallengeJudgment;
import com.kh.totalproject.entity.CodeHint;
import com.kh.totalproject.entity.CodeHintAttempt;
import com.kh.totalproject.exception.CodeReviewException;
import com.kh.totalproject.exception.CodeReviewGenerationException;
import com.kh.totalproject.repository.CodeChallengeJudgmentRepository;
import com.kh.totalproject.repository.CodeChallengeRepository;
import com.kh.totalproject.repository.CodeHintAttemptRepository;
import com.kh.totalproject.repository.CodeHintRepository;
import com.kh.totalproject.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 코딩테스트 단계별 AI 힌트 (개념 → 접근 방법 → 구현 방향).
 *
 * - 공개 단계는 서버가 정한다: 요청한 단계가 (공개된 단계 + 1)일 때만 생성하고, 이미 공개된 단계면 저장된 힌트를 돌려주고,
 *   그보다 높으면 거절한다. RAG 서비스에는 그 단계 하나와 그보다 낮은 공개된 힌트만 보낸다.
 * - 기준 제출은 Spring에서 소유권·문제 일치·오답 여부를 DB 값으로 확인한다. 모델이 다른 제출 ID를 요청해도 RAG 서비스는
 *   이 요청에 담긴 제출 하나만 갖고 있다.
 * - CodeReviewService와 같은 흐름: [짧은 tx: 생성 선점] → [tx 없음: RAG 호출] → [짧은 tx: 결과 저장].
 *   중복 클릭·동시 요청은 유니크 제약/@Version으로 한 요청만 선점하고, 늦게 끝난 이전 요청은 생성 차수가 달라 저장되지 않는다.
 *   생성 실패는 공개 단계를 올리지 않는다.
 */
@RequiredArgsConstructor
@Service
@Slf4j
public class CodeHintService {
    // 힌트 형식(프롬프트·응답 구조)이 바뀌면 올린다 -- 기존 버전 기록은 남고 새 버전 시도가 1단계부터 시작된다.
    public static final int HINT_VERSION = 1;
    public static final int MAX_LEVEL = 3;
    // RagHintClient 읽기 타임아웃 150초보다 길게
    static final long STALE_GENERATING_SECONDS = 240;
    static final int MAX_QUESTION_CHARS = 300;
    static final int MAX_PSEUDOCODE_LINES = 12;
    private static final int MAX_COMPILE_OUTPUT_CHARS = 1500;
    private static final int MAX_ERROR_MESSAGE_LENGTH = 500;

    private final CodeChallengeRepository challengeRepository;
    private final CodeChallengeJudgmentRepository judgmentRepository;
    private final CodeHintAttemptRepository attemptRepository;
    private final CodeHintRepository hintRepository;
    private final UserRepository userRepository;
    private final RagHintClient ragHintClient;
    private final TransactionTemplate transactionTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private record Basis(CodeChallenge challenge, CodeChallengeJudgment judgment) {}

    // 선점에 성공하면 request/level/generation이, 이미 공개됐거나 생성 중이면 existing이 채워진다
    private record Claim(CodeHintStateResponse existing, Long attemptId, int level, int generation,
                         RagHintRequest request, String question) {}

    /** 힌트 기준으로 고를 수 있는 본인의 오답 제출 (최근 10건). */
    public List<HintSubmissionResponse> listFailedSubmissions(Long challengeId, Long userKey) {
        requireChallengeId(challengeId);
        return transactionTemplate.execute(status ->
                judgmentRepository.findTop10ByUser_UserKeyAndCodeChallenge_ChallengeIdAndPassedFalseOrderByJudgmentIdDesc(
                                userKey, challengeId).stream()
                        .map(j -> new HintSubmissionResponse(j.getJudgmentId(), j.getSubmittedAt(),
                                j.getCodeLanguage().name(), j.getFailureCause() == null ? null : j.getFailureCause().name()))
                        .toList());
    }

    /** 풀이 시도의 현재 힌트 상태. 아직 요청한 적 없으면 revealedLevel=0, hints=[]. */
    public CodeHintStateResponse getState(Long challengeId, Long judgmentId, Long userKey) {
        return transactionTemplate.execute(status -> {
            loadBasis(challengeId, judgmentId, userKey);
            return attemptRepository.findByUser_UserKeyAndCodeChallenge_ChallengeIdAndAttemptKeyAndHintVersion(
                            userKey, challengeId, CodeHintAttempt.keyOf(judgmentId), HINT_VERSION)
                    .map(this::toState)
                    .orElseGet(() -> new CodeHintStateResponse(null, challengeId, judgmentId, 0, MAX_LEVEL,
                            CodeHintStatus.READY, null, null, List.of()));
        });
    }

    /**
     * request.level 단계 힌트 요청. 생성은 이 요청 스레드에서 끝까지 진행되고, 결과가 반영된 상태를 돌려준다.
     * 이미 공개된 단계면 생성 없이 현재 상태, 다른 요청이 생성 중이면 GENERATING 상태를 돌려준다.
     */
    public CodeHintStateResponse requestHint(CodeHintRequest request, Long userKey) {
        if (request == null || request.level() == null || request.level() < 1 || request.level() > MAX_LEVEL) {
            throw new CodeReviewException(HttpStatus.BAD_REQUEST, "힌트 단계는 1~" + MAX_LEVEL + " 사이여야 합니다.");
        }
        String question = request.question() == null || request.question().isBlank() ? null : request.question().strip();
        if (question != null && question.length() > MAX_QUESTION_CHARS) {
            throw new CodeReviewException(HttpStatus.BAD_REQUEST, "질문은 " + MAX_QUESTION_CHARS + "자 이하로 입력해주세요.");
        }
        String language = parseLanguage(request.language());

        Claim claim;
        try {
            claim = transactionTemplate.execute(status -> claim(request, question, language, userKey));
        }
        catch (DataIntegrityViolationException | OptimisticLockingFailureException e) {
            // 동시에 들어온 다른 요청이 먼저 선점함 -- 그 요청의 상태를 그대로 보여준다
            log.info("Hint for challenge {} / judgment {} already claimed by a concurrent request",
                    request.challengeId(), request.judgmentId());
            return getState(request.challengeId(), request.judgmentId(), userKey);
        }
        if (claim.existing() != null) {
            return claim.existing();
        }

        // 트랜잭션 밖에서 외부 AI 호출
        String contentJson = null;
        String errorMessage = null;
        try {
            CodeHintContent content = ragHintClient.generate(claim.request());
            contentJson = objectMapper.writeValueAsString(
                    validated(content, claim.level(), claim.request().submission() != null));
        }
        catch (CodeReviewGenerationException e) {
            errorMessage = e.getMessage();
        }
        catch (JsonProcessingException e) {
            log.error("Failed to serialize hint for attempt {}", claim.attemptId(), e);
            errorMessage = "AI 힌트를 저장하지 못했습니다. 다시 시도해주세요.";
        }
        catch (RuntimeException e) {
            log.error("Unexpected error while generating hint for attempt {}", claim.attemptId(), e);
            errorMessage = "AI 힌트를 생성하지 못했습니다. 잠시 후 다시 시도해주세요.";
        }

        String finalContentJson = contentJson;
        String finalErrorMessage = errorMessage;
        return transactionTemplate.execute(status -> finish(claim, finalContentJson, finalErrorMessage));
    }

    private Claim claim(CodeHintRequest request, String question, String language, Long userKey) {
        int level = request.level();
        Basis basis = loadBasis(request.challengeId(), request.judgmentId(), userKey);
        CodeChallengeJudgment judgment = basis.judgment();
        String code = judgment == null ? null : decodeSubmittedCode(judgment);

        CodeHintAttempt attempt = attemptRepository
                .findByUser_UserKeyAndCodeChallenge_ChallengeIdAndAttemptKeyAndHintVersion(
                        userKey, basis.challenge().getChallengeId(), CodeHintAttempt.keyOf(request.judgmentId()), HINT_VERSION)
                .orElse(null);
        if (attempt == null) {
            attempt = attemptRepository.saveAndFlush(CodeHintAttempt.builder()
                    .user(userRepository.getReferenceById(userKey))
                    .codeChallenge(basis.challenge())
                    .judgment(judgment)
                    .hintVersion(HINT_VERSION)
                    .build());
        }

        // 이미 공개된 단계(중복 클릭 포함) 또는 다른 요청이 생성 중 → 생성 없이 현재 상태
        if (level <= attempt.getRevealedLevel() || isFreshGenerating(attempt)) {
            return new Claim(toState(attempt), null, 0, 0, null, null);
        }
        if (level != attempt.getRevealedLevel() + 1) {
            throw new CodeReviewException(HttpStatus.CONFLICT,
                    "이전 단계 힌트를 먼저 확인해주세요. (현재 " + attempt.getRevealedLevel() + "단계까지 공개됨)");
        }

        attempt.startGenerating(level);
        attempt = attemptRepository.saveAndFlush(attempt);

        List<RagHintRequest.RevealedHint> revealed = hintRepository
                .findByAttempt_HintAttemptIdOrderByLevelAsc(attempt.getHintAttemptId()).stream()
                .filter(h -> h.getLevel() < level)
                .map(h -> new RagHintRequest.RevealedHint(h.getLevel(), renderForModel(readContent(h))))
                .toList();

        RagHintRequest ragRequest = new RagHintRequest(
                level,
                challengeContext(basis.challenge()),
                judgment == null ? null : new RagHintRequest.FailedSubmission(
                        judgment.getJudgmentId(),
                        judgment.getCodeLanguage().name(),
                        code,
                        judgment.getFailureCause().name(),
                        summarizeFailure(judgment.getFailureCause(), judgment.getFailureDetail(), code)
                ),
                revealed,
                question,
                judgment == null ? language : null
        );
        return new Claim(null, attempt.getHintAttemptId(), level, attempt.getGenerationCount(), ragRequest, question);
    }

    private CodeHintStateResponse finish(Claim claim, String contentJson, String errorMessage) {
        CodeHintAttempt attempt = attemptRepository.findById(claim.attemptId())
                .orElseThrow(() -> new CodeReviewException(HttpStatus.NOT_FOUND, "힌트 기록을 찾을 수 없습니다."));
        // 이 요청이 멈춘 것으로 간주돼 다른 요청이 같은 단계를 다시 선점했으면, 그쪽 결과를 덮어쓰지 않는다
        if (!Objects.equals(attempt.getGeneratingLevel(), claim.level())
                || attempt.getGenerationCount() != claim.generation()) {
            return toState(attempt);
        }
        if (contentJson != null) {
            hintRepository.saveAndFlush(CodeHint.builder()
                    .attempt(attempt)
                    .level(claim.level())
                    .contentJson(contentJson)
                    .question(claim.question())
                    .build());
            attempt.reveal(claim.level());
        }
        else {
            attempt.failGenerating(truncate(errorMessage));
        }
        return toState(attemptRepository.saveAndFlush(attempt));
    }

    private Basis loadBasis(Long challengeId, Long judgmentId, Long userKey) {
        requireChallengeId(challengeId);
        CodeChallenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new CodeReviewException(HttpStatus.NOT_FOUND, "존재하지 않는 문제입니다."));
        if (judgmentId == null) {
            return new Basis(challenge, null);
        }
        CodeChallengeJudgment judgment = judgmentRepository.findById(judgmentId)
                .orElseThrow(() -> new CodeReviewException(HttpStatus.NOT_FOUND, "존재하지 않는 제출입니다."));
        if (userKey == null || !userKey.equals(judgment.getUser().getUserKey())) {
            throw new CodeReviewException(HttpStatus.FORBIDDEN, "본인의 제출만 힌트 기준으로 사용할 수 있습니다.");
        }
        if (!challengeId.equals(judgment.getCodeChallenge().getChallengeId())) {
            throw new CodeReviewException(HttpStatus.BAD_REQUEST, "이 문제에 대한 제출이 아닙니다.");
        }
        if (Boolean.TRUE.equals(judgment.getPassed()) || judgment.getFailureCause() == null) {
            throw new CodeReviewException(HttpStatus.CONFLICT,
                    "정답 처리된 제출은 힌트 기준으로 사용할 수 없습니다. AI 코드 리뷰를 이용해주세요.");
        }
        return new Basis(challenge, judgment);
    }

    private static void requireChallengeId(Long challengeId) {
        if (challengeId == null) {
            throw new CodeReviewException(HttpStatus.BAD_REQUEST, "문제 ID가 필요합니다.");
        }
    }

    private static String parseLanguage(String language) {
        if (language == null || language.isBlank()) {
            return null;
        }
        try {
            return CodeChallengeLanguage.valueOf(language).name();
        }
        catch (IllegalArgumentException e) {
            throw new CodeReviewException(HttpStatus.BAD_REQUEST, "지원하지 않는 언어입니다.");
        }
    }

    private static String decodeSubmittedCode(CodeChallengeJudgment judgment) {
        String code;
        try {
            code = CodeReviewService.decodeCode(judgment.getCode());
        }
        catch (CodeReviewException e) {
            throw new CodeReviewException(HttpStatus.UNPROCESSABLE_ENTITY, "제출 코드를 읽을 수 없어 이 제출 기준 힌트를 만들 수 없습니다.");
        }
        if (code.length() > CodeReviewService.MAX_CODE_CHARS) {
            throw new CodeReviewException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "코드가 너무 길어 이 제출 기준 힌트를 만들 수 없습니다. (최대 " + CodeReviewService.MAX_CODE_CHARS + "자)");
        }
        return code;
    }

    private boolean isFreshGenerating(CodeHintAttempt attempt) {
        return attempt.getGeneratingLevel() != null
                && attempt.getGenerationStartedAt() != null
                && attempt.getGenerationStartedAt().isAfter(LocalDateTime.now().minusSeconds(STALE_GENERATING_SECONDS));
    }

    private static RagReviewRequest.Challenge challengeContext(CodeChallenge challenge) {
        return new RagReviewRequest.Challenge(
                challenge.getChallengeId(),
                challenge.getTitle(),
                challenge.getDescription(),
                challenge.getCond(),
                challenge.getCategory(),
                challenge.getDifficulty() == null ? null : challenge.getDifficulty().name(),
                challenge.getTimeLimitMs(),
                challenge.getMemoryLimitMb()
        );
    }

    // ---------- 채점 실패 정보 축약 ----------

    private static final Pattern ERROR_TYPE = Pattern.compile("\\b([A-Z][A-Za-z0-9]*(?:Error|Exception))\\b");
    private static final Pattern NATIVE_ERROR = Pattern.compile(
            "(Segmentation fault|Floating point exception|Aborted|AddressSanitizer: [\\w-]+|UndefinedBehaviorSanitizer)");
    // Python: File "/x/main.py", line 7 / Java: (Main.java:12) / Node: /x/main.js:3:5 / C: main.c:4:2
    private static final Pattern SOURCE_LINE = Pattern.compile("\\.(?:java|py|js|mjs|cjs|c|cpp|cc)\"?(?:, line |:)(\\d+)");
    private static final Pattern ABSOLUTE_PATH = Pattern.compile("(?:/[\\w.-]+)+/([\\w.-]+)");

    /**
     * 모델에 보낼 채점 실패 요약. 런타임 오류의 failureDetail은 사용자 프로그램의 stderr 원문이라
     * 숨겨진 테스트 입력이 그대로 섞일 수 있다(예: 예외 메시지에 입력값, 디버그 출력). 그래서 오류 유형과
     * 제출 코드 범위 안의 줄 번호만 뽑아 보낸다. 오답은 원래 상세가 없고(어떤 테스트인지도 저장되지 않음),
     * 시간·메모리 초과는 유형만, 컴파일 오류는 테스트 입력이 관여하지 않으므로 경로만 지우고 잘라서 보낸다.
     */
    static String summarizeFailure(FailureCause cause, String detail, String code) {
        String raw = detail == null ? "" : detail;
        return switch (cause) {
            case WRONG_ANSWER -> "오답: 일부 테스트 케이스의 출력이 기대 출력과 다릅니다. 어떤 테스트인지, 입력과 기대 출력은 제공되지 않습니다.";
            case COMPILE_ERROR -> {
                String cleaned = ABSOLUTE_PATH.matcher(raw).replaceAll("$1").strip();
                if (cleaned.length() > MAX_COMPILE_OUTPUT_CHARS) {
                    cleaned = cleaned.substring(0, MAX_COMPILE_OUTPUT_CHARS) + "\n...(이하 생략)";
                }
                yield "컴파일 오류. 컴파일러 출력:\n" + (cleaned.isEmpty() ? "(출력 없음)" : cleaned);
            }
            case RUNTIME_ERROR -> {
                Set<String> types = new LinkedHashSet<>();
                Matcher typeMatcher = ERROR_TYPE.matcher(raw);
                while (typeMatcher.find() && types.size() < 3) {
                    types.add(typeMatcher.group(1));
                }
                Matcher nativeMatcher = NATIVE_ERROR.matcher(raw);
                while (nativeMatcher.find() && types.size() < 3) {
                    types.add(nativeMatcher.group(1));
                }
                long lineCount = code == null ? 0 : code.lines().count();
                Set<Integer> lines = new TreeSet<>();
                Matcher lineMatcher = SOURCE_LINE.matcher(raw);
                while (lineMatcher.find() && lines.size() < 5) {
                    try {
                        int line = Integer.parseInt(lineMatcher.group(1));
                        if (line >= 1 && line <= lineCount) {
                            lines.add(line);
                        }
                    }
                    catch (NumberFormatException ignored) {
                        // 줄 번호가 int 범위를 넘으면 무시
                    }
                }
                yield "런타임 오류. 오류 유형: " + (types.isEmpty() ? "확인되지 않음" : String.join(", ", types))
                        + " / 관련 줄 번호: " + (lines.isEmpty() ? "확인되지 않음" : lines.toString())
                        + " (오류 메시지 원문은 테스트 입력이 포함될 수 있어 제공하지 않습니다)";
            }
            case RUNTIME_TIMEOUT -> "실행 시간 제한 초과.";
            case COMPILE_TIMEOUT -> "컴파일 시간 제한 초과.";
            case SANDBOX_TIMEOUT -> "채점 환경 전체 시간 제한 초과.";
            case RUNTIME_OUT_OF_MEMORY -> "실행 중 메모리 제한 초과.";
            case COMPILE_OUT_OF_MEMORY -> "컴파일 중 메모리 제한 초과.";
            case SANDBOX_OUT_OF_MEMORY -> "채점 환경 전체 메모리 제한 초과.";
        };
    }

    // ---------- 응답 검증 ----------

    /**
     * RAG 서비스도 같은 검증을 하지만 저장 전에 한 번 더 확인한다: 요청한 단계와 같은 단계인지,
     * 그 단계의 필드만 채워졌는지(상위 단계 필드가 섞이면 거절), 링크가 앱 내부 학습 페이지인지.
     */
    CodeHintContent validated(CodeHintContent content, int level, boolean withSubmission) {
        if (content == null || content.level() == null || content.level() != level || isBlank(content.summary())) {
            throw formatError();
        }
        List<String> concepts = orEmpty(content.concepts());
        List<String> questions = orEmpty(content.guidingQuestions());
        List<CodeHintContent.DataStructure> dataStructures = orEmpty(content.dataStructures());
        List<String> steps = orEmpty(content.steps());
        boolean hasApproach = !isBlank(content.approach());
        boolean hasPseudocode = !isBlank(content.pseudocode());

        boolean shapeOk = switch (level) {
            case 1 -> inRange(concepts, 1, 3) && inRange(questions, 1, 3)
                    && !hasApproach && dataStructures.isEmpty() && steps.isEmpty() && !hasPseudocode;
            case 2 -> hasApproach && inRange(dataStructures, 1, 3)
                    && dataStructures.stream().allMatch(d -> d != null && !isBlank(d.name()) && !isBlank(d.reason()))
                    && concepts.isEmpty() && questions.isEmpty() && steps.isEmpty() && !hasPseudocode;
            case 3 -> inRange(steps, 2, 7) && concepts.isEmpty() && questions.isEmpty()
                    && !hasApproach && dataStructures.isEmpty()
                    && (!hasPseudocode || content.pseudocode().lines().count() <= MAX_PSEUDOCODE_LINES);
            default -> false;
        };
        if (!shapeOk) {
            throw formatError();
        }

        CodeHintContent.FailureInsight insight = content.failureInsight();
        if (insight != null && (!withSubmission || isBlank(insight.text()) || insight.speculative() == null)) {
            throw formatError();
        }

        List<CodeReviewContent.Lesson> lessons = orEmpty(content.lessons());
        if (lessons.size() > 3) {
            throw formatError();
        }
        for (CodeReviewContent.Lesson lesson : lessons) {
            if (lesson == null || isBlank(lesson.title()) || lesson.url() == null
                    || !lesson.url().startsWith("/study/") || lesson.url().contains("//")) {
                throw formatError();
            }
        }

        List<String> texts = new ArrayList<>(List.of(content.summary()));
        texts.addAll(concepts);
        texts.addAll(questions);
        texts.addAll(steps);
        if (hasApproach) texts.add(content.approach());
        if (hasPseudocode) texts.add(content.pseudocode());
        if (insight != null) texts.add(insight.text());
        if (texts.stream().anyMatch(t -> t != null && t.contains("```"))) {
            throw formatError();
        }

        return new CodeHintContent(level, content.summary(), concepts, questions,
                hasApproach ? content.approach() : null, dataStructures, steps,
                hasPseudocode ? content.pseudocode() : null, insight, lessons);
    }

    // 이전 단계 힌트를 다음 단계 생성에 넘길 때의 평문 표현 (링크는 넘기지 않는다)
    static String renderForModel(CodeHintContent content) {
        if (content == null) {
            return "";
        }
        StringBuilder sb = new StringBuilder(content.summary() == null ? "" : content.summary());
        orEmpty(content.concepts()).forEach(c -> sb.append("\n- 개념: ").append(c));
        orEmpty(content.guidingQuestions()).forEach(q -> sb.append("\n- 질문: ").append(q));
        if (!isBlank(content.approach())) sb.append("\n- 접근: ").append(content.approach());
        orEmpty(content.dataStructures()).forEach(d -> sb.append("\n- 자료구조: ").append(d.name()).append(" (").append(d.reason()).append(")"));
        if (content.failureInsight() != null) {
            sb.append("\n- 실패 관찰").append(Boolean.TRUE.equals(content.failureInsight().speculative()) ? "(추정)" : "")
                    .append(": ").append(content.failureInsight().text());
        }
        String text = sb.toString();
        return text.length() > 4000 ? text.substring(0, 4000) : text;
    }

    private CodeHintContent readContent(CodeHint hint) {
        try {
            return objectMapper.readValue(hint.getContentJson(), CodeHintContent.class);
        }
        catch (JsonProcessingException e) {
            log.warn("Stored hint {} has unreadable content: {}", hint.getHintId(), e.getMessage());
            return null;
        }
    }

    private CodeHintStateResponse toState(CodeHintAttempt attempt) {
        List<CodeHintStateResponse.Item> hints = hintRepository
                .findByAttempt_HintAttemptIdOrderByLevelAsc(attempt.getHintAttemptId()).stream()
                .map(h -> new CodeHintStateResponse.Item(h.getLevel(), readContent(h), h.getRevealedAt(),
                        h.getJudgment() == null ? null : h.getJudgment().getJudgmentId(), h.getQuestion()))
                .toList();

        CodeHintStatus status = CodeHintStatus.READY;
        Integer pendingLevel = null;
        String errorMessage = null;
        if (attempt.getGeneratingLevel() != null) {
            pendingLevel = attempt.getGeneratingLevel();
            if (isFreshGenerating(attempt)) {
                status = CodeHintStatus.GENERATING;
            }
            else {
                status = CodeHintStatus.FAILED;
                errorMessage = "이전 힌트 생성이 중단되었습니다. 다시 시도해주세요.";
            }
        }
        else if (attempt.getLastError() != null) {
            status = CodeHintStatus.FAILED;
            pendingLevel = attempt.getRevealedLevel() + 1;
            errorMessage = attempt.getLastError();
        }

        return new CodeHintStateResponse(attempt.getHintAttemptId(), attempt.getCodeChallenge().getChallengeId(),
                attempt.getJudgment() == null ? null : attempt.getJudgment().getJudgmentId(),
                attempt.getRevealedLevel(), MAX_LEVEL, status, pendingLevel, errorMessage, hints);
    }

    private static CodeReviewGenerationException formatError() {
        return new CodeReviewGenerationException("AI가 공개 범위에 맞는 힌트를 만들지 못했습니다. 다시 시도해주세요.");
    }

    private static <T> List<T> orEmpty(List<T> list) {
        return list == null ? List.of() : list;
    }

    private static boolean inRange(List<?> list, int min, int max) {
        return list.size() >= min && list.size() <= max && list.stream().allMatch(Objects::nonNull)
                && list.stream().noneMatch(v -> v instanceof String s && s.isBlank());
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private static String truncate(String message) {
        if (message == null) {
            return "AI 힌트를 생성하지 못했습니다.";
        }
        return message.length() > MAX_ERROR_MESSAGE_LENGTH ? message.substring(0, MAX_ERROR_MESSAGE_LENGTH) : message;
    }
}
