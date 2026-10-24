package com.kh.totalproject.controller;

import com.kh.totalproject.constant.webhook.enums.WebhookCallbackResponseStatus;
import com.kh.totalproject.dto.callbackevent.JudgeJobError;
import com.kh.totalproject.dto.callbackevent.JudgeJobResultPassed;
import com.kh.totalproject.dto.callbackevent.TestCaseResult;
import com.kh.totalproject.dto.callbackevent.JudgeJobResultUnpassed;
import com.kh.totalproject.service.CodeChallengeJudgmentService;
import com.kh.totalproject.service.SseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/webhook/callback-event")
@RequiredArgsConstructor
public class WebhookCallbackController {
    private final SseService sseService;
    private final CodeChallengeJudgmentService codeChallengeJudgmentService;

    @PostMapping("/test-case-result")
    public ResponseEntity<Void> handleTestCaseResultEvent(@RequestBody TestCaseResult event) {
        log.info("{}", event);
        boolean proceedJob = sseService.sendTestCaseResult(event);
        int callbackResponseCode = proceedJob ? WebhookCallbackResponseStatus.PROCEED.getStatusCode() : WebhookCallbackResponseStatus.STOP.getStatusCode();
        return ResponseEntity.status(callbackResponseCode).build();
    }

    @PostMapping("/judgment-passed")
    public ResponseEntity<Void> handlePassedJudgmentEvent(@RequestBody JudgeJobResultPassed event) {
        log.info("{}", event);
        codeChallengeJudgmentService.saveJudgmentHistory(event);
        return ResponseEntity.status(WebhookCallbackResponseStatus.OK.getStatusCode()).build();
    }

    @PostMapping("/judgment-unpassed")
    public ResponseEntity<Void> handleUnpassedJudgmentEvent(@RequestBody JudgeJobResultUnpassed event) {
        log.info("{}", event);
        codeChallengeJudgmentService.saveJudgmentHistory(event);
        return ResponseEntity.status(WebhookCallbackResponseStatus.OK.getStatusCode()).build();
    }

    @PostMapping("/error")
    public ResponseEntity<Void> handleErrorEvent(@RequestBody JudgeJobError event) {
        log.info("{}", event);
        sseService.sendJudgeJobError(event);
        return ResponseEntity.status(WebhookCallbackResponseStatus.OK.getStatusCode()).build();
    }
}
