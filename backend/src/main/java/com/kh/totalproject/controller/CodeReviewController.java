package com.kh.totalproject.controller;

import com.kh.totalproject.dto.response.CodeReviewResponse;
import com.kh.totalproject.dto.response.ReviewTargetResponse;
import com.kh.totalproject.service.CodeReviewService;
import com.kh.totalproject.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/************************************
 * - 정답 제출 AI 코드 리뷰 (로그인 필요 -- SecurityConfig의 permitAll 목록에 없음)
 * - 사용자 ID는 항상 인증 정보(JWT)에서 꺼낸다. 요청 본문/파라미터로 받지 않는다.
 ***********************************/
@RestController
@RequestMapping("/api/code-review")
@RequiredArgsConstructor
public class CodeReviewController {
    private final CodeReviewService codeReviewService;

    // SSE 채점 jobId → 그 채점으로 저장된 제출(judgmentId)
    @GetMapping("/target")
    public ResponseEntity<ReviewTargetResponse> findTarget(@RequestParam String jobId) {
        Long userKey = SecurityUtil.getCurrentUserIdOrThrow();
        return ResponseEntity.ok(codeReviewService.findTargetByJob(jobId, userKey));
    }

    // 저장된 리뷰 조회 (없으면 status=null)
    @GetMapping("/{judgmentId}")
    public ResponseEntity<CodeReviewResponse> getReview(@PathVariable Long judgmentId) {
        Long userKey = SecurityUtil.getCurrentUserIdOrThrow();
        return ResponseEntity.ok(codeReviewService.getReview(judgmentId, userKey));
    }

    // 리뷰 생성 요청 (완료된 리뷰가 있으면 재사용, 생성 중이면 PENDING, 실패했으면 재시도)
    @PostMapping("/{judgmentId}")
    public ResponseEntity<CodeReviewResponse> requestReview(@PathVariable Long judgmentId) {
        Long userKey = SecurityUtil.getCurrentUserIdOrThrow();
        return ResponseEntity.ok(codeReviewService.requestReview(judgmentId, userKey));
    }
}
