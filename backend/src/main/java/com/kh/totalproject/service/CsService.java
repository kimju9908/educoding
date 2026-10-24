package com.kh.totalproject.service;

import com.google.firebase.database.DatabaseException;
import com.kh.totalproject.dto.request.ReportRequest;
import com.kh.totalproject.entity.*;
import com.kh.totalproject.exception.DuplicateResourceException;
import com.kh.totalproject.repository.*;
import com.kh.totalproject.util.SecurityUtil;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CsService {
    private final UserRepository userRepository;
    private final BoardRepository boardRepository;
    private final ReportRepository reportRepository;

    // 신고 게시글 생성 서비스
    public Boolean createReportPost(ReportRequest reportRequest) {
        Long userKey = SecurityUtil.getCurrentUserIdOrThrow();
        User user = userRepository.findById(userKey)
                .orElseThrow(() -> new EntityNotFoundException("해당 유저를 찾을 수 없습니다"));
        Board board = boardRepository.findById(reportRequest.getBoardId())
                .orElseThrow(() -> new EntityNotFoundException("해당 게시글을 찾을 수 없습니다"));

        boolean alreadyReported = reportRepository.existsByUserAndBoard(user, board);
        if (alreadyReported) {
            throw new DuplicateResourceException("이미 신고된 게시글 입니다");
        }
        // setName 으로 닉네임을 변수값으로 지정
        reportRequest.setName(user.getNickname());  // 여기서 굳이 Nickname 으로 저장 할 필요 없이 userKey 로 저장 - 추후에 수정 필요
        // 해당 신고하는 게시글 지정
        reportRequest.setBoardId(board.getId());
        // 엔티티화 한후 저장
        // 생성된 게시글 저장 return true
        reportRepository.save(reportRequest.toCreateReportPost(user, board));
        return true;
    }

//    // 유저가 작성한 Report 게시판에서의 관리자 답변 보기
//    public Page<ReportCommentResponse> listReportComment(Long reportId, int page, int size, String sortBy, String order) {
//        try {
//            Long userKey = SecurityUtil.getCurrentUserIdOrThrow();
//            User user = userRepository.findById(userKey)
//                    .orElseThrow(() -> new NotFoundException("해당 유저를 찾을 수 없습니다."));
//            ReportBoard reportBoard = reportRepository.findById(reportId)
//                    .orElseThrow(() -> new NotFoundException("해당 게시글을 찾을 수 없습니다."));
//            if (!user.getUserKey().equals(reportBoard.getUser().getUserKey())) {
//                throw new ForbiddenException("댓글을 열람 할 권한이 없습니다.");
//            }
//            if (sortBy == null || sortBy.isEmpty()) {
//                sortBy = "createdAt";  // 기본적으로 최신순
//            }
//            if (order == null || order.isEmpty()) {
//                order = "ASC";  // 기본적으로 내림차순
//            }
//            Sort sort = Sort.by(Sort.Direction.fromString(order), sortBy);
//            Pageable pageable = PageRequest.of(page - 1, size, sort);
//            Page<ReportComment> reportComments = reportCommentRepository.findByReportBoard_Id(reportId, pageable);
//            return reportComments.map(ReportCommentResponse::ofAdminReply);
//        } catch (BadRequestException e) {
//            System.err.println("게시글내 답변 조회 실패: " + e.getMessage());
//            return Page.empty();
//        }
//    }
//
//    // 유저가 작성한 Suggestion 게시판에서의 관리자 답변 보기
//    public Page<SuggestionCommentResponse> listSuggestionComment(Long suggestionId, int page, int size, String sortBy, String order) {
//        try {
//            Long userKey = SecurityUtil.getCurrentUserIdOrThrow();
//            User user = userRepository.findById(userKey)
//                    .orElseThrow(() -> new NotFoundException("해당 유저를 찾을 수 없습니다."));
//            SuggestionBoard suggestionBoard = suggestionRepository.findById(suggestionId)
//                    .orElseThrow(() -> new NotFoundException("해당 게시글을 찾을 수 없습니다."));
//            if (!user.getUserKey().equals(suggestionBoard.getUser().getUserKey())) {
//                throw new ForbiddenException("댓글을 열람 할 권한이 없습니다.");
//            }
//            if (sortBy == null || sortBy.isEmpty()) {
//                sortBy = "createdAt";  // 기본적으로 최신순
//            }
//            if (order == null || order.isEmpty()) {
//                order = "ASC";  // 기본적으로 내림차순
//            }
//            Sort sort = Sort.by(Sort.Direction.fromString(order), sortBy);
//            Pageable pageable = PageRequest.of(page - 1, size, sort);
//            Page<SuggestionComment> suggestionComments = suggestionCommentRepository.findBySuggestionBoard_Id(suggestionId, pageable);
//            return suggestionComments.map(SuggestionCommentResponse::ofAdminReply);
//        } catch (BadRequestException e) {
//            System.err.println("게시글내 답변 조회 실패: " + e.getMessage());
//            return Page.empty();
//        }
//    }

//    public Boolean AddReportComment(String authorizationHeader, ReportCommentRequest reportCommentRequest) {
//        try {
//            String token = authorizationHeader.replace("Bearer ", "");
//            // 토큰에서 인증 정보 확인
//            jwtUtil.getAuthentication(token);
//            // Access 토큰에서 id 추출
//            Long userId = jwtUtil.extractUserId(token);
//
//            User user = userRepository.findById(userId)
//                    .orElseThrow(() -> new IllegalArgumentException("해당 유저를 찾을 수 없습니다."));
//            ReportBoard reportBoard = reportRepository.findById(reportCommentRequest.getReportId())
//                    .orElseThrow(() -> new IllegalArgumentException("해당 게시물을 찾을 수 없습니다."));
//            ReportComment reportComment = reportCommentRequest.toAddComment(user, reportBoard);
//            reportCommentRepository.save(reportComment);
//            return true;
//        } catch (AccessDeniedException e) {
//            throw new AccessDeniedException("해당글의 댓글을 열람 할 권한이 없습니다.");
//        }
//    }
//
//    public Boolean AddSuggestionComment(String authorizationHeader, SuggestionCommentRequest suggestionCommentRequest) {
//        try {
//            String token = authorizationHeader.replace("Bearer ", "");
//            // 토큰에서 인증 정보 확인
//            jwtUtil.getAuthentication(token);
//            // Access 토큰에서 id 추출
//            Long userId = jwtUtil.extractUserId(token);
//
//            User user = userRepository.findById(userId)
//                    .orElseThrow(() -> new IllegalArgumentException("해당 유저를 찾을 수 없습니다."));
//            SuggestionBoard suggestionBoard = suggestionRepository.findById(suggestionCommentRequest.getSuggestionId())
//                    .orElseThrow(() -> new IllegalArgumentException("해당 게시글을 찾을 수 없습니다."));
//            SuggestionComment suggestionComment = suggestionCommentRequest.toAddComment(user, suggestionBoard);
//            suggestionCommentRepository.save(suggestionComment);
//            return true;
//        } catch (AccessDeniedException e) {
//            throw new AccessDeniedException("해당글의 댓글을 열람 할 권한이 없습니다.");
//        }
//    }
//
//    public Boolean ModifyReportComment(String authorizationHeader, ReportCommentRequest reportCommentRequest) {
//        try {
//            String token = authorizationHeader.replace("Bearer ", "");
//            // 토큰에서 인증 정보 확인
//            jwtUtil.getAuthentication(token);
//            // Access 토큰에서 id 추출
//            Long userId = jwtUtil.extractUserId(token);
//
//            User user = userRepository.findById(userId)
//                    .orElseThrow(() -> new IllegalArgumentException("해당 유저를 찾을 수 없습니다."));
//            ReportBoard reportBoard = reportRepository.findById(reportCommentRequest.getReportId())
//                    .orElseThrow(() -> new IllegalArgumentException("해당 게시글을 찾을 수 없습니다."));
//            ReportComment existingComment = reportCommentRepository.findById(reportCommentRequest.getCommentId())
//                    .orElseThrow(() -> new IllegalArgumentException("해당 댓글을 찾을 수 없습니다."));
//            ReportComment reportComment = reportCommentRequest.toModifyComment(user, reportBoard, existingComment);
//            reportCommentRepository.save(reportComment);
//            return true;
//        } catch (AccessDeniedException e) {
//            throw new AccessDeniedException("해당글의 댓글을 열람 할 권한이 없습니다.");
//        }
//    }
//
//    public Boolean ModifySuggestionComment(String authorizationHeader, SuggestionCommentRequest suggestionCommentRequest) {
//        try {
//            String token = authorizationHeader.replace("Bearer ", "");
//            // 토큰에서 인증 정보 확인
//            jwtUtil.getAuthentication(token);
//            // Access 토큰에서 id 추출
//            Long userId = jwtUtil.extractUserId(token);
//
//            User user = userRepository.findById(userId)
//                    .orElseThrow(() -> new IllegalArgumentException("해당 유저를 찾을 수 없습니다."));
//            SuggestionBoard suggestionBoard = suggestionRepository.findById(suggestionCommentRequest.getSuggestionId())
//                    .orElseThrow(() -> new IllegalArgumentException("해당 게시글을 찾을 수 없습니다."));
//            SuggestionComment existingComment = suggestionCommentRepository.findById(suggestionCommentRequest.getCommentId())
//                    .orElseThrow(() -> new IllegalArgumentException("해당 댓글을 찾을 수 없습니다."));
//            SuggestionComment suggestionComment = suggestionCommentRequest.toModifyComment(user, suggestionBoard, existingComment);
//            suggestionCommentRepository.save(suggestionComment);
//        } catch (AccessDeniedException e) {
//            throw new AccessDeniedException("해당글의 댓글을 열람 할 권한이 없습니다.");
//        }
//        return null;
//    }
//
//    public Boolean DeleteReportPost(Long reportId) {
//        try {
//            Long userKey = SecurityUtil.getCurrentUserIdOrThrow();
//            User user = userRepository.findById(userKey)
//                    .orElseThrow(() -> new NotFoundException("해당 유저를 찾을 수 없습니다."));
//            ReportBoard reportBoard = reportRepository.findById(reportId)
//                    .orElseThrow(() -> new NotFoundException("해당 댓글을 찾을 수 없습니다."));
//            if (!reportBoard.getUser().getUserKey().equals(user.getUserKey())) {
//                throw new ForbiddenException("해당 게시글을 삭제 할 권한이 없습니다.");
//            } else {
//                reportRepository.deleteById(reportId);
//                return true;
//            }
//        } catch (BadRequestException e) {
//            throw new BadRequestException("게시글 삭제 로직 실패." + e);
//        }
//    }
//
//    public Boolean DeleteSuggestionPost(Long suggestionId) {
//        try {
//            Long userKey = SecurityUtil.getCurrentUserIdOrThrow();
//            User user = userRepository.findById(userKey)
//                    .orElseThrow(() -> new NotFoundException("해당 유저를 찾을 수 없습니다."));
//            SuggestionBoard suggestionBoard = suggestionRepository.findById(suggestionId)
//                    .orElseThrow(() -> new NotFoundException("해당 댓글을 찾을 수 없습니다."));
//            if (!suggestionBoard.getUser().getUserKey().equals(user.getUserKey())) {
//                throw new ForbiddenException("해당 게시글을 삭제 할 권한이 없습니다.");
//            } else {
//                suggestionRepository.deleteById(suggestionId);
//                return true;
//            }
//        } catch (BadRequestException e) {
//            throw new BadRequestException("게시글 삭제 로직 실패." + e);
//        }
//    }
}
