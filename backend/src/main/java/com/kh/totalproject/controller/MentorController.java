package com.kh.totalproject.controller;

import com.kh.totalproject.dto.request.MentorPageRenderingRequest;
import com.kh.totalproject.dto.request.MentorPostRequest;
import com.kh.totalproject.dto.response.MentorResponse;
import com.kh.totalproject.dto.response.PaginationResponse;
import com.kh.totalproject.service.MentorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor // final 또는 nonNull 로 지정된 필드의 생성자를 자동으로 생성
@RequestMapping("/mentor")
public class MentorController {

    private final MentorService mentorService;

    // 멘토 전체 Item Box Data 조회
    @PostMapping("/contentData")
    ResponseEntity<PaginationResponse> getAllMentorItemBox(@RequestBody MentorPageRenderingRequest request) {
        PaginationResponse response = mentorService.getAllMentorItemBox(
                request.getCurrentPage(),request.getSize(), request.getSearchKeyword(), request.getSortType(), request.getTag());
        return ResponseEntity.ok(response);
    }

    // 선택한 멘토 모달창 상세보기 Data 조회
    @GetMapping("/contentData/detail/{mentorId}")
    ResponseEntity<MentorResponse> getSelectMentorModalDetailData(@PathVariable("mentorId") Long mentorId) {
        System.out.println("🔥 요청받은 mentorId: " + mentorId);  // mentorId가 정상적으로 넘어오는지 확인!
        MentorResponse mentorResponse = mentorService.getMentorModalDetailData(mentorId);
        return ResponseEntity.ok(mentorResponse);
    }

    // Mentor Post Delete
    @DeleteMapping("/delete/{mentorId}")
    public ResponseEntity<Void> deleteMentor(
            @PathVariable("mentorId") Long mentorId) { // 현재 로그인한 사용자 정보
        mentorService.deleteMentor(mentorId);
        return ResponseEntity.noContent().build(); // 204 No Content 반환
    }

    // Mentor Post Data -> DB 저장
    @PostMapping("/postData")
    ResponseEntity<MentorPostRequest> getWriteMentorPost(@RequestBody MentorPostRequest request) {
        MentorPostRequest saveMentorPost = mentorService.saveMentorPost(request);
        return ResponseEntity.ok(saveMentorPost);
    }

    // Mentor Post Data -> DB 저장 (수정)
    @PostMapping("/modifyData")
    public ResponseEntity<MentorPostRequest> modifyMentorPost(@RequestBody MentorPostRequest request) {
        MentorPostRequest modifyMentorPost = mentorService.modifyMentorPost(request);
        return ResponseEntity.ok(modifyMentorPost);
    }

    // Mentor Post Page 에서 미리보기 기능 (프로필, 닉네임 읽어오기)
    @GetMapping("/previewRead/{userKey}")
    ResponseEntity<MentorResponse> getPreviewReadData(@PathVariable("userKey") Long userKey) {
        MentorResponse mentorResponse = mentorService.getMentorModalPreviewData(userKey);
        return ResponseEntity.ok(mentorResponse);
    }

    // Mentor 신청하기 (Email 발송)
    @PostMapping("/apply/email")
    public ResponseEntity<Boolean> applyMentorEmail(@RequestParam("mentorId") Long mentorId,
                                                    @RequestParam("menteeKey") Long menteeKey,
                                                    @RequestParam("applyMenteeText") String applyMenteeText) {
        Boolean result = mentorService.sendMentorApplicationEmail(mentorId, menteeKey, applyMenteeText);
        return ResponseEntity.ok(result);
    }

    // Mentee Review 작성 권한 부여 및 이메일 발송
    @PostMapping("/grantForMenteeReview")
    public ResponseEntity<Boolean> grantForMenteeReview(@RequestParam("mentorId") Long mentorId,
                                                        @RequestParam("menteeKey") Long menteeKey) {
        Boolean result = mentorService.grantForMenteeReview(mentorId,menteeKey);
        return ResponseEntity.ok(result);
    }


}