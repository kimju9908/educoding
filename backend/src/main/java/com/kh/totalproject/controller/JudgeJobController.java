package com.kh.totalproject.controller;

import com.kh.totalproject.dto.request.SubmitCodeForJudgmentRequest;
import com.kh.totalproject.dto.response.ErrorResponse;
import com.kh.totalproject.dto.response.ExecuteJudgeJobResponse;
import com.kh.totalproject.dto.response.CreateJudgeJobResponse;
import com.kh.totalproject.service.CodeChallengeJudgeJobService;
import com.kh.totalproject.service.SseService;
import com.kh.totalproject.util.Base64Util;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import static com.kh.totalproject.util.SecurityUtil.getCurrentUserIdOrThrow;

/************************************
 * - 코드 제출(채점 작업 Redis 등록)
 * - 채점 작업 구독 (SSE 연결)
 * - 채점 작업 실행 Webhook 호출
 * - 채점 작업 중단 Webhook 호출
 ***********************************/
@RestController
@RequestMapping("/api/judge-job")
@Slf4j
@RequiredArgsConstructor
public class JudgeJobController {
    private final CodeChallengeJudgeJobService judgeJobService;
    private final SseService sseService;

    @PostMapping
    public ResponseEntity<?> createJudgeJob(
        @RequestBody SubmitCodeForJudgmentRequest requestDto
    ) {
        String code = requestDto.getCode();
        if (code == null || code.isEmpty() || !Base64Util.isBase64Encoded(code)) {
            return ResponseEntity.badRequest().body(new ErrorResponse("코드가 유효하지 않습니다"));
        }

        CreateJudgeJobResponse response = judgeJobService.createJudgeJob(
                requestDto.getChallengeId(),
                getCurrentUserIdOrThrow(),
                code,
                requestDto.getCodeLanguage()
        );
        return ResponseEntity.ok().body(response);
    }

    @GetMapping(value = "/{jobId}/subscription", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(@PathVariable(value = "jobId", required = true) String jobId) {
        if (!judgeJobService.isJudgeJobExists(jobId, getCurrentUserIdOrThrow())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        }

        // Last-Event-ID 기반 재연결 로직은 추후 필요시 추가할 것
        return sseService.subscribe(jobId);
    }

    @PostMapping("/{jobId}/execution")
    public ResponseEntity<?> executeJudgmentJob(
        @PathVariable String jobId
    ) {
        if (!judgeJobService.isJudgeJobExists(jobId, getCurrentUserIdOrThrow())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        }

        ExecuteJudgeJobResponse response = judgeJobService.executeJudgeJobViaWebhook(
                jobId,
                getCurrentUserIdOrThrow()
        );
        return ResponseEntity.accepted().body(response);
    }

    @PostMapping("/{jobId}/cancellation")
    public ResponseEntity<?> cancelJudgmentJob(
        @PathVariable String jobId
    ) {
        if (!judgeJobService.isJudgeJobExists(jobId, getCurrentUserIdOrThrow())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        }

        // 처리에 실패하는 경우 내부적으로 다음과 같이 동작
        // - 작업 중단 웹훅 요청에 실패하는 경우(Flask 서버가 5xx/4xx 응답) => advice에 의해 즉시 500 반환
        // - 파싱에 실패하는 경우 => advice에 의해 즉시 500 반환

        // 성공하든(202) 실패하든(500) 클라이언트는 이 요청과 동시에 스트림 세션 정리
        // Spring Boot도 구독 Map에서 해당 작업 정리
        // 추후 파이썬 서버와 동기화를 위해 조정 가능
        sseService.clearSubscription(jobId, null);

        judgeJobService.cancelJudgeJobViaWebhook(
                jobId,
                getCurrentUserIdOrThrow()
        );
        return ResponseEntity.accepted().build();
    }
}
