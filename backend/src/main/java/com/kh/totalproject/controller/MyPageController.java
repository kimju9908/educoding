/* 회원정보 수정, 탈퇴 및 내 작성글, 댓글, 요청 전달 받는 컨트롤러
*  관리자 전용 페이지는 따로 컨트롤러 분리 할 예정 */
package com.kh.totalproject.controller;


import com.kh.totalproject.dto.request.ReportRequest;
import com.kh.totalproject.dto.request.UserRequest;
import com.kh.totalproject.dto.response.*;
import com.kh.totalproject.service.CsService;
import com.kh.totalproject.service.FirebaseStorageService;
import com.kh.totalproject.service.MyPageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/my")
public class MyPageController {
    private final MyPageService myPageService;
    private final FirebaseStorageService firebaseStorageService;

    // 내 정보 조회
    @GetMapping("/profile")
    public ResponseEntity<UserResponse> myProfile() {
        return ResponseEntity.ok(myPageService.getMyProfile());
    }

    // 내 정보 수정, 아마 버튼 클릭시 조회에서 바로 수정 입력칸 받을 수 있게
    @PutMapping("/profile-modify")
    public ResponseEntity<?> modifyUserInfo(@RequestBody UserRequest userRequest) {
        return ResponseEntity.ok(myPageService.modifyMyProfile(userRequest));
    }

    // 닉네임 중복 검사 API 추가
    @GetMapping("/profile/check-nickname")
    public ResponseEntity<Boolean> checkNickname(@RequestParam("nickname") String nickname) {
        return ResponseEntity.ok(myPageService.isNicknameAvailable(nickname));
    }


    // 닉네임 변경 API
    @PutMapping("/profile/change-nickname")
    public ResponseEntity<Boolean> changeNewNickname(@RequestParam("newNickname") String newNickname) {
        return ResponseEntity.ok(myPageService.changeNickname(newNickname));
    }



    // 현재 비밀번호 확인 API 추가
    @PostMapping("/profile-checkPw")
    public ResponseEntity<Boolean> checkPw(@RequestParam("inputPw") String inputPw) {
        return ResponseEntity.ok(myPageService.checkPw(inputPw));
    }


    // 내 정보에서 비밀번호 수정
    @PutMapping("/profile-changePw")
    public ResponseEntity<Boolean> changePw(@RequestParam("newPw") String newPw) {
        return ResponseEntity.ok(myPageService.changePw(newPw));
    }

    // 내 정보에서 멘토 목록 보기
    @GetMapping("/mentorList")
    public ResponseEntity<PaginationResponse> myMentorList(
            @RequestParam(name = "userKey") Long userKey,
            @RequestParam(name = "page", defaultValue = "1") int currentPage,
            @RequestParam(name = "size", defaultValue = "10") int size){

        return ResponseEntity.ok(myPageService.myMentorList(userKey, currentPage, size ));
    }

    // 내 정보에서 멘티 목록 보기에서 나의 멘토링글 정보
    @GetMapping("/myMentoringPost")
    public ResponseEntity<PaginationResponse> myMentoringPost(
            @RequestParam(name = "userKey") Long userKey,
            @RequestParam(name = "page", defaultValue = "1") int currentPage,
            @RequestParam(name = "size", defaultValue = "10") int size){

        return ResponseEntity.ok(myPageService.myMentoringPost(userKey, currentPage, size ));
    }


    // 내 정보에서 멘티 목록 보기
    @GetMapping("/menteeList")
    public ResponseEntity<PaginationResponse> myMenteeList(
            @RequestParam(name = "userKey") Long userKey,
            @RequestParam(name = "page", defaultValue = "1") int currentPage,
            @RequestParam(name = "size", defaultValue = "10") int size){

        return ResponseEntity.ok(myPageService.myMenteeList(userKey, currentPage, size ));
    }

    // 내 정보에서 내가 작성한 글 보기
    @GetMapping("/list/post")
    public ResponseEntity<Page<BoardResponse>> listMyPost(@RequestParam(value="page", defaultValue = "1") int page,
                                                          @RequestParam(value="size", defaultValue = "10") int size,
                                                          @RequestParam(value="sortBy", required = false) String sortBy,
                                                          @RequestParam(value="order", required = false) String order) {
        return ResponseEntity.ok(myPageService.myPost(page, size, sortBy, order));
    }

    // 내가 작성한 신고 작성 글 목록 보기 요청 / 응답
    @GetMapping("/list/report")
    public ResponseEntity<Page<ReportResponse>> listMyReportPost(@RequestParam(value="page", defaultValue = "1") int page,
                                                                 @RequestParam(value="size", defaultValue = "10") int size,
                                                                 @RequestParam(value="sortBy", defaultValue = "createdAt") String sortBy,
                                                                 @RequestParam(value="order", defaultValue = "DESC") String order,
                                                                 @RequestParam(value="status", defaultValue = "INACTIVE") String status) {
        return ResponseEntity.ok(myPageService.myReportList(page, size, sortBy, order, status));
    }

    // 내가 작성한 신고 글 자세히 보기 요청 / 응답
    @GetMapping("/list/report/{reportId}")
    public ResponseEntity<ReportResponse> MyReportPost(@PathVariable("reportId") Long reportId) {
        return ResponseEntity.ok(myPageService.myReportPost(reportId));
    }

    // 유저 신고글에서 관리자의 답변 요청 / 응답
    @GetMapping("/list/report/comment")
    ResponseEntity<Page<ReportCommentResponse>> getReportComment(@RequestParam("reportId") Long reportId,
                                                                 @RequestParam(value="page", defaultValue = "1") int page,
                                                                 @RequestParam(value="size", defaultValue = "10") int size,
                                                                 @RequestParam(value="sortBy", defaultValue = "createdAt") String sortBy,
                                                                 @RequestParam(value="order", defaultValue = "ASC") String order) {
        return ResponseEntity.ok(myPageService.listReportComment(reportId, page, size, sortBy, order));
    }

    // 내가 작성한 신고 글 삭제
    @DeleteMapping("/delete/report/{reportId}")
    public ResponseEntity<Boolean> deleteMyReport(@PathVariable("reportId") Long reportId) {
        return ResponseEntity.ok(myPageService.deleteMyReportPost(reportId));
    }

    @PostMapping("/profile/imageupload")
    public ResponseEntity<String> uploadMyProfile(@RequestParam("file")MultipartFile file,
                                                  @RequestParam("fileName") String fileName) throws IOException {
        return ResponseEntity.ok(firebaseStorageService.uploadFile(file, fileName));
    }
    @PostMapping("/profile/imagedelete")
    public ResponseEntity<Boolean> deleteMyProfile() {
        return ResponseEntity.ok(firebaseStorageService.deleteFile());
    }

    @DeleteMapping("/profile/deregister")
    public ResponseEntity<Boolean> deleteMyAccount() {
        return ResponseEntity.ok(myPageService.deleteMyAccount());
    }
}
