package com.kh.totalproject.controller;

import com.kh.totalproject.dto.request.CodeHintRequest;
import com.kh.totalproject.dto.response.CodeHintStateResponse;
import com.kh.totalproject.dto.response.HintSubmissionResponse;
import com.kh.totalproject.service.CodeHintService;
import com.kh.totalproject.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/************************************
 * - 코딩테스트 단계별 AI 힌트 (로그인 필요 -- SecurityConfig의 permitAll 목록에 없음)
 * - 사용자 ID는 항상 인증 정보(JWT)에서 꺼낸다. 요청 본문/파라미터로 받지 않는다.
 * - 풀이 시도는 (challengeId, judgmentId) 로 지정한다. judgmentId가 없으면 제출 전(문제 조건만) 시도.
 ***********************************/
@RestController
@RequestMapping("/api/code-hint")
@RequiredArgsConstructor
public class CodeHintController {
    private final CodeHintService codeHintService;

    // 힌트 기준으로 고를 수 있는 본인의 오답 제출 목록
    @GetMapping("/submissions")
    public ResponseEntity<List<HintSubmissionResponse>> listSubmissions(@RequestParam Long challengeId) {
        Long userKey = SecurityUtil.getCurrentUserIdOrThrow();
        return ResponseEntity.ok(codeHintService.listFailedSubmissions(challengeId, userKey));
    }

    // 풀이 시도의 공개된 힌트와 진행 상태
    @GetMapping
    public ResponseEntity<CodeHintStateResponse> getState(@RequestParam Long challengeId,
                                                          @RequestParam(required = false) Long judgmentId) {
        Long userKey = SecurityUtil.getCurrentUserIdOrThrow();
        return ResponseEntity.ok(codeHintService.getState(challengeId, judgmentId, userKey));
    }

    // level 단계 힌트 요청 (서버가 공개 가능 여부를 결정)
    @PostMapping
    public ResponseEntity<CodeHintStateResponse> requestHint(@RequestBody CodeHintRequest request) {
        Long userKey = SecurityUtil.getCurrentUserIdOrThrow();
        return ResponseEntity.ok(codeHintService.requestHint(request, userKey));
    }
}
