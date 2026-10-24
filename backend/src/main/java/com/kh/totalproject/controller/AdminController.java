/* 관리자 전용 페이지
*  모든 Controller 작용에 Role.Admin 인지 체크
*  유저, 게시글 에 관한 CRUD 중 Read 과 Delete 를 가능하게 하며
*  신고 글 과 건의사항 글에 대한 답변 가능 Create */

package com.kh.totalproject.controller;

import com.kh.totalproject.dto.request.ReportCommentRequest;
import com.kh.totalproject.service.AdminService;
import com.kh.totalproject.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;


@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/admin")
public class AdminController {
    private final AdminService adminService;

    // Admin 정보 열람 요청 / 응답
    @GetMapping("/profile")
    public ResponseEntity<?> getAdminProfile() {
        return ResponseEntity.ok(adminService.adminProfile());
    }

    // Admin 이메일 변경 요청 / 응답
    @PutMapping("/modify/email")
    public ResponseEntity<?> putAdminEmail(@RequestParam("email") String email) {
        return ResponseEntity.ok(adminService.changeEmail(email));
    }

    // Admin 비밀번호 확인 요청 / 응답
    @PostMapping("/check/pw")
    public ResponseEntity<?> checkAdminPassword(@RequestBody String password) {
        return ResponseEntity.ok(adminService.confirmPw(password));
    }

    // Admin 비밀번호 변경 요청 / 응답
    @PutMapping("/modify/pw")
    public ResponseEntity<?> putAdminPassword(@RequestBody String password) {
        return ResponseEntity.ok(adminService.changePw(password));
    }

    // 모든 유저를 페이지네이션 목록 요청 / 응답
    @GetMapping("/list/users")
    public ResponseEntity<?> listAllUserInfo(@RequestParam(value="page", defaultValue = "1") int page,
                                             @RequestParam(value="size", defaultValue = "10") int size,
                                             @RequestParam(value="sortBy", defaultValue = "registeredAt") String sortBy,
                                             @RequestParam(value="order", defaultValue = "DESC") String order,
                                             @RequestParam(value="search", required = false) String search) {
        return ResponseEntity.ok(adminService.listAllUserInfo(page, size, sortBy, order, search));
    }

    // 모든 유저를 받은 뒤 삭제 할 계정 의 key 를 받아 해당 유저를 삭제 하는 요청 / 응답

    // [1,2,3]
    @DeleteMapping("/list/users/{userKeys}")
    public ResponseEntity<?> deleteUser(@PathVariable("userKeys") List<Long> userKeys) {
        return ResponseEntity.ok(adminService.deleteUser(userKeys));
    }

    // 유저가 작성한 신고 글 목록 요청 / 응답
    @GetMapping("/list/report")
    public ResponseEntity<?> listAllReport(@RequestParam(value="page", defaultValue = "1") int page,
                                           @RequestParam(value="size", defaultValue = "10") int size,
                                           @RequestParam(value="sortBy", defaultValue = "createdAt") String sortBy,
                                           @RequestParam(value="order", defaultValue = "DESC") String order,
                                           @RequestParam(value="status", defaultValue = "ACTIVE") String status) {
        return ResponseEntity.ok(adminService.listReportPost(page, size, sortBy, order, status));
    }

    @GetMapping("/list/report/{reportId}")
    public ResponseEntity<?> getReportPost(@PathVariable("reportId") Long reportId) {
        return ResponseEntity.ok(adminService.getReportPost(reportId));
    }

    // 유저가 작성한 신고 글 삭제 요청 / 응답 (관리자 권한)
    @DeleteMapping("/delete/report")
    public ResponseEntity<?> deleteReport(@RequestParam("reportId") Long reportId) {
        return ResponseEntity.ok(adminService.deleteReportPost(reportId));
    }

    // 유저가 작성한 신고 글 관리자 답변 보기 요청 / 응답
    @GetMapping("/list/report/comments")
    public ResponseEntity<?> listReportReply(@RequestParam("reportId") Long reportId,
                                             @RequestParam(value="page", defaultValue = "1") int page,
                                             @RequestParam(value="size", defaultValue = "10") int size,
                                             @RequestParam(value="sortBy", defaultValue = "createdAt") String sortBy,
                                             @RequestParam(value="order", defaultValue = "DESC") String order) {
        return ResponseEntity.ok(adminService.listReportReply(reportId, page, size, sortBy, order));
    }

    // 신고 글에 대한 답변 요청 / 응답
    @PostMapping("/reply/report")
    public ResponseEntity<?> replyReport(@RequestBody ReportCommentRequest reportCommentRequest) {
        return ResponseEntity.ok(adminService.replyReport(reportCommentRequest));
    }


    // 신고글에 대한 처리 글 삭제 기능
    @DeleteMapping("/delete/post/{boardId}")
    public ResponseEntity<?> deleteUserPost(@PathVariable("boardId") Long boardId) {
        return ResponseEntity.ok(adminService.deletePost(boardId));
    }

    // 유저 일별 증가량 요청 / 응답
    @GetMapping("/data/user/increase")
    public ResponseEntity<?> getWeeklyUserIncrease() {
        return ResponseEntity.ok(adminService.weeklyJoinNumberIncrement());
    }
//    // 공지사항 글 작성
//    @GetMapping("/list/announcement")
//    public ResponseEntity<Page<?>> listAnnouncement() {
//        return ResponseEntity.ok(adminService.listAnnouncement());
//    }
//
//    // 공지사항글 작성 (필요한지 필요 없는지 유무 정하면 엔티티 만들어야함)
//    @PostMapping("/new/announcement")
//    public ResponseEntity<?> createAnnouncement(@RequestHeader("Authorization") String authorizationHeader) {
//        return ResponseEntity.ok(adminService.createAnnouncement(authorizationHeader));
//    }
//
//    // 공지사항 글 수정
//    @PutMapping("/modify/announcement")
//    public ResponseEntity<?> modifyAnnouncement(@RequestHeader("Authorization") String authorizationHeader,
//                                                @RequestParam Long announcementId) {
//        return ResponseEntity.ok(adminService.modifyAnnouncement(authorizationHeader, announcementId));
//    }
//
//    // 공지사항 글 삭제
//    @DeleteMapping("/delete/announcement")
//    public ResponseEntity<?> deleteAnnouncement(@RequestHeader("Authorization") String authorizationHeader,
//                                                @RequestParam Long announcementId) {
//        return ResponseEntity.ok(adminService.deleteAnnouncement(authorizationHeader, announcementId));
//    }
}