package com.kh.totalproject.controller;

import com.kh.totalproject.dto.request.MentorReviewRequest;
import com.kh.totalproject.dto.response.MentorReviewResponse;
import com.kh.totalproject.service.MentorReviewService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/mentorReview")
public class MentorReviewController {

    private final MentorReviewService mentorReviewService;

    // 선택한 멘토 모달창 리뷰 Data 조회 (모든 리뷰 반환)
    @GetMapping("/reviewData/{mentorId}")
    ResponseEntity<List<MentorReviewResponse>> getSelectReviewData(@PathVariable("mentorId") Long mentorId) {
        List<MentorReviewResponse> reviewResponses = mentorReviewService.getReviewData(mentorId);
        return ResponseEntity.ok(reviewResponses);
    }

    // 해당 멘토글의 멘티인지 유무 확인
    @GetMapping("/menteeCheck")
    ResponseEntity<Boolean> menteeCheck(@RequestParam("mentorId") Long mentorId,
                                                     @RequestParam("menteeKey") Long menteeKey) {
        Boolean result = mentorReviewService.menteeCheck(mentorId, menteeKey);
        return ResponseEntity.ok(result);
    }

    // 리뷰 등록
    @PostMapping("/reviewSubmit")
    ResponseEntity<Boolean> reviewSubmit(@RequestBody MentorReviewRequest request) {
        Boolean result = mentorReviewService.reviewSubmit(request);
        return ResponseEntity.ok(result);
    }

    // 리뷰 "삭제" (실제로는 수정)
    @PatchMapping("/deleteReview/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable("reviewId") Long reviewId,
            @RequestBody MentorReviewRequest request) { // 요청 본문 추가
        mentorReviewService.updateReviewToDeleted(reviewId, request.getRating(), request.getReviewText());
        return ResponseEntity.noContent().build(); // 204 No Content
    }
}
