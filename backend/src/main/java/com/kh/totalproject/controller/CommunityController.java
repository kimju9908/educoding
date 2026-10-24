/* 각각 커뮤니티에 해당하는 게시글 보기, 게시글 작성, 게시글 수정 등등 요청과 응답에 필요한 컨트롤러 */
package com.kh.totalproject.controller;

import com.kh.totalproject.constant.Reaction;
import com.kh.totalproject.dto.request.BoardRequest;
import com.kh.totalproject.dto.request.CommentRequest;
import com.kh.totalproject.dto.response.BoardReactionResponse;
import com.kh.totalproject.dto.response.BoardResponse;
import com.kh.totalproject.dto.response.CommentResponse;
import com.kh.totalproject.dto.response.UserResponse;
import com.kh.totalproject.service.CommunityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/community")
public class CommunityController {
    private final CommunityService communityService;

    // 게시판별 단일 글 작성시 게시판 type 을 전달 받아 서비스에서 해당 로직으로 연결
    @PostMapping("/new/post")
    ResponseEntity<Boolean> createPost(@RequestBody BoardRequest boardRequest,
                                       @RequestParam("boardType") String boardType) {
        return ResponseEntity.ok(communityService.createPost(boardRequest, boardType));
    }

    // 게시판별 단일 글 수정시 게시판 type 을 전달 받아 서비스에서 해당 로직으로 연결
    @PutMapping("/modify/post")
    ResponseEntity<Boolean> modifyPost(@RequestBody BoardRequest boardRequest,
                                       @RequestParam("boardType") String boardType) {
        return ResponseEntity.ok(communityService.modifyPost(boardRequest, boardType));
    }

    // 게시글 삭제시 게시글 번호를 전달 받아 서비스에서 해당 로직으로 연결
    @DeleteMapping("/delete/post/{id}")
    ResponseEntity<Boolean> deletePost(@PathVariable("id") Long id) {
        return ResponseEntity.ok(communityService.deletePost(id));
    }


    // 게시판별 전체 게시글 조회시 게시판 type 을 전달 받아 서비스에서 해당 로직으로 연결
    @GetMapping("/list/post")
    ResponseEntity<Page<BoardResponse>> listAll(@RequestParam(value="page", defaultValue = "1") int page,
                                                @RequestParam(value="size", defaultValue = "10") int size,
                                                @RequestParam("boardType") String boardType,
                                                @RequestParam(value="sortBy", required = false) String sortBy,
                                                @RequestParam(value="order", required = false) String order,
                                                @RequestParam(value="status", required = false) String status,
                                                @RequestParam(value="enumFilter", required = false) String enumFilter,
                                                @RequestParam(value="search", required = false) String search) {
        return ResponseEntity.ok(communityService.listAllByBoardTypeWithSort(page, size, boardType, sortBy, order, status, enumFilter, search));
    }

    // 게시판별 단일 게시글 조회시 게시판 type 을 전달 받아 서비스에서 해당 로직으로 연결
    @GetMapping("/list/post/{id}")
    ResponseEntity<BoardResponse> getPost(@PathVariable("id") Long id) {
        return ResponseEntity.ok(communityService.listOneById(id));
    }

    // 단순 조회수 증가 요청 / 응답
    @GetMapping("/list/post/view")
    ResponseEntity<Boolean> getView(@RequestParam("id") Long id) {
        return ResponseEntity.ok(communityService.listOneByIdCheck(id));
    }

    // 게시글의 댓글 요청 / 응답
    @GetMapping("/list/comment")
    ResponseEntity<Page<CommentResponse>> listComment(@RequestParam("boardId") Long boardId,
                                                      @RequestParam(value="page", defaultValue = "1") int page,
                                                      @RequestParam(value="size", defaultValue = "10") int size,
                                                      @RequestParam(value="sortBy", defaultValue = "createdAt") String sortBy,
                                                      @RequestParam(value="order", defaultValue = "ASC") String order) {
        return ResponseEntity.ok(communityService.listComment(boardId, page, size, sortBy, order));
    }

    // 댓글 생성 요청 / 응답
    @PostMapping("/add/comment")
    ResponseEntity<Boolean> addComment(@RequestBody CommentRequest commentRequest) {
        return ResponseEntity.ok(communityService.addComment(commentRequest));
    }

    // 댓글 수정 요청 / 응답
    @PutMapping("/modify/comment")
    ResponseEntity<Boolean> modifyComment(@RequestBody CommentRequest commentRequest) {
        return ResponseEntity.ok(communityService.modifyComment(commentRequest));
    }

    // 댓글 삭제 요청 / 응답
    @DeleteMapping("/delete/comment/{id}")
    ResponseEntity<Boolean> deleteComment(@PathVariable("id") Long id) {
        return ResponseEntity.ok(communityService.deleteComment(id));
    }

    // 게시글 내 좋아요 싫어요 클릭시 요청 / 응답
    @PostMapping("/reaction/voting")
    public ResponseEntity<?> toggleReaction(@RequestParam("boardId") Long boardId,
                                            @RequestParam("userId") Long userId,
                                            @RequestParam("reaction") Reaction reaction) {
        communityService.toggleReaction(boardId, userId, reaction);
        return ResponseEntity.ok().build();
    }

    // 유저별 좋아요 싫어요 상태
    @GetMapping("/reaction/status")
    public ResponseEntity<BoardReactionResponse> getReactionStatus(@RequestParam("boardId") Long boardId,
                                                                   @RequestParam("userId") Long userId) {
        BoardReactionResponse reactionStatus = communityService.getReactionStatus(boardId, userId);
        return ResponseEntity.ok(reactionStatus);
    }

    // 게시판에서 TopWriter 요청 / 응답
    @GetMapping("/topWriter")
    public ResponseEntity<List<BoardResponse>> getTopWriter() {
        return ResponseEntity.ok(communityService.getTopWriterBoard());
    }

    // 주간 인기글 요청 / 응답
    @GetMapping("/weeklyPopularPost")
    public ResponseEntity<List<BoardResponse>> weeklyPopularPost() {
        return ResponseEntity.ok(communityService.getWeeklyPopularPost());
    }

    // 상대방의 아이디를 클릭 했을때 상대방의 게시글 목록 요청 / 응답
    @GetMapping("/list/others/post")
    public ResponseEntity<Page<BoardResponse>> listOthersPost(@RequestParam("userId") Long userId,
                                                              @RequestParam(value="page", defaultValue = "1") int page,
                                                              @RequestParam(value="size", defaultValue = "10") int size,
                                                              @RequestParam(value="sortBy", required = false) String sortBy,
                                                              @RequestParam(value="order", required = false) String order) {
        return ResponseEntity.ok(communityService.listOthersPost(userId, page, size, sortBy, order));
    }

    // 상대방의 아이디를 클릭시 상대방의 프로필 요청 / 응답
    @GetMapping("/list/others/profile/{userId}")
    public ResponseEntity<UserResponse> listOthersProfile(@PathVariable("userId") Long userId) {
        return ResponseEntity.ok(communityService.listOthersProfile(userId));
    }

    // 유사글 찾기
    @GetMapping("/similarPost/{boardId}")
    public ResponseEntity<List<BoardResponse>> getSimilarPost(@PathVariable("boardId") Long boardId) {
        return ResponseEntity.ok(communityService.getSimilarPost(boardId));
    }
}
