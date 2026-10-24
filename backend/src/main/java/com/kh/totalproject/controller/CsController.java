package com.kh.totalproject.controller;

import com.kh.totalproject.dto.request.ReportCommentRequest;
import com.kh.totalproject.dto.request.ReportRequest;
import com.kh.totalproject.dto.response.ReportCommentResponse;
import com.kh.totalproject.service.CsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/customerService")
public class CsController {
    private final CsService csService;

    // 신고 게시글 작성 요청 / 응답
    @PostMapping("/new/post/report")
    ResponseEntity<Boolean> createReportPost(@RequestBody ReportRequest reportRequest) {
        return ResponseEntity.ok(csService.createReportPost(reportRequest));
    }


//    // 유저 신고글에서 관리자의 답변 요청 / 응답
//    @GetMapping("/list/report/comment")
//    ResponseEntity<Page<ReportCommentResponse>> getReportComment(@RequestParam("reportId") Long reportId,
//                                                                 @RequestParam(value="page", defaultValue = "1") int page,
//                                                                 @RequestParam(value="size", defaultValue = "10") int size,
//                                                                 @RequestParam(value="sortBy", defaultValue = "createdAt") String sortBy,
//                                                                 @RequestParam(value="order", defaultValue = "ASC") String order) {
//        return ResponseEntity.ok(csService.listReportComment(reportId, page, size, sortBy, order));
//    }
//
//    // 문의글에서 관리자의 답변 요청 / 응답
//    @GetMapping("/list/suggestion/comment")
//    ResponseEntity<Page<SuggestionCommentResponse>> getSuggestionComment(@RequestParam("suggestionId") Long suggestionId,
//                                                                         @RequestParam(value="page", defaultValue = "1") int page,
//                                                                         @RequestParam(value="size", defaultValue = "10") int size,
//                                                                         @RequestParam(value="sortBy", defaultValue = "createdAt") String sortBy,
//                                                                         @RequestParam(value="order", defaultValue = "ASC") String order) {
//        return ResponseEntity.ok(csService.listSuggestionComment(suggestionId, page, size, sortBy, order));
//    }
//
//    // 사용자 신고 글 삭제 요청 / 응답
//    @DeleteMapping("/delete/report/post/{reportId}")
//    ResponseEntity<Boolean> deleteReportPost(@PathVariable("reportId") Long reportId) {
//        return ResponseEntity.ok(csService.DeleteReportPost(reportId));
//    }
//
//    // 사용자 문의 글 삭제 요청 / 응답
//    @DeleteMapping("/delete/suggestion/post/{suggestionId}")
//    ResponseEntity<Boolean> deleteSuggestionPost(@PathVariable("suggestionId") Long suggestionId) {
//        return ResponseEntity.ok(csService.DeleteSuggestionPost(suggestionId));
//    }
}
