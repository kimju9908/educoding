package com.kh.totalproject.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch.core.DeleteByQueryRequest;
import co.elastic.clients.elasticsearch.core.DeleteByQueryResponse;
import com.google.firebase.database.DatabaseException;
import com.kh.totalproject.constant.Status;
import com.kh.totalproject.dto.request.UserRequest;
import com.kh.totalproject.dto.response.*;
import com.kh.totalproject.entity.*;
import com.kh.totalproject.exception.DuplicateResourceException;
import com.kh.totalproject.exception.ElasticException;
import com.kh.totalproject.exception.InvalidValueException;
import com.kh.totalproject.repository.*;
import com.kh.totalproject.util.JwtUtil;
import com.kh.totalproject.util.SecurityUtil;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class MyPageService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final BoardRepository boardRepository;
    private final ReportRepository reportRepository;
    private final CommentRepository commentRepository;
    private final BoardReactionRepository boardReactionRepository;
    private final ReportCommentRepository reportCommentRepository;
    private final EmailValidationRepository emailValidationRepository;
    private final TokenRepository tokenRepository;
    private final MentorRepository mentorRepository;
    private final JwtUtil jwtUtil;
    private final ElasticsearchClient elasticsearchClient;

    // 내 정보 열람 메서드
    public UserResponse getMyProfile() {
        // 토큰 문제시 401 에러 발생
        Long userKey = SecurityUtil.getCurrentUserIdOrThrow();
        User user = userRepository.findById(userKey)
                .orElseThrow(() -> new EntityNotFoundException("해당 유저를 찾을 수 없습니다"));
        int postCntByUser = (int) boardRepository.countByUserUserKey(user.getUserKey());
        return UserResponse.ofMyProfile(user, postCntByUser);
    }

    // 내 정보 수정 메서드
    public Boolean modifyMyProfile(UserRequest userRequest) {
        Long userKey = SecurityUtil.getCurrentUserIdOrThrow();
        User user = userRepository.findById(userKey)
                .orElseThrow(() -> new EntityNotFoundException("해당 유저를 찾을 수 없습니다"));
        User updatedData = userRequest.toModifyProfile(user);
        userRepository.save(updatedData);
        return true;
    }

    // 닉네임 중복 검사 로직
    public boolean isNicknameAvailable(String nickname) {
        return !userRepository.existsByNickname(nickname); // 닉네임이 DB에 없으면 사용 가능 (true 반환)
    }

    // 닉네임 변경 메서드
    public boolean changeNickname(String newNickname) {
        Long userKey = SecurityUtil.getCurrentUserIdOrThrow();
        User user = userRepository.findById(userKey)
                .orElseThrow(() -> new EntityNotFoundException("해당 유저를 찾을 수 없습니다"));
        // 닉네임 중복 검사
        if (!isNicknameAvailable(newNickname)) {
            throw new InvalidValueException("이미 사용 중인 닉네임입니다.");
        }
        user.setNickname(newNickname);
        userRepository.save(user);
        return true;
    }


    // 현재 비밀번호 확인 메소드 추가
    public boolean checkPw(String inputPw) {
        Long userKey = SecurityUtil.getCurrentUserIdOrThrow();
        User user = userRepository.findById(userKey)
                .orElseThrow(() -> new EntityNotFoundException("해당 유저를 찾을 수 없습니다"));
        String storedPassword = user.getPassword();
        if (storedPassword == null) {
            return true; // 비밀번호가 NULL 이면 검증 자동 통과 (3자 로그인)
        }
        return passwordEncoder.matches(inputPw, storedPassword);
    }

    // 내 비밀번호 변경
    public boolean changePw(String newPw) {
        Long userKey = SecurityUtil.getCurrentUserIdOrThrow();
        User user = userRepository.findById(userKey)
                .orElseThrow(() -> new EntityNotFoundException("해당 유저를 찾을 수 없습니다"));
        String storedPassword = user.getPassword();

        if (storedPassword != null && !passwordEncoder.matches(newPw, storedPassword)) {
            throw new DuplicateResourceException("기존에 사용중인 비밀번호와 동일합니다, 새로운 비밀번호를 입력 하세요");
        }
        user.setPassword(passwordEncoder.encode(newPw)); // 새로운 비밀번호 설정
        userRepository.save(user);
        return true;
    }

    //     내 작성글 보기,
    //     내정보에서 열람을 할 수 있는 페이지 네이션으로 설정
    //     BoardId 값을 반환하기 때문에 단일 게시글에 접근을 할 때는 CommunityService 에서 listOne 에 해당하는 메서드를 호출 해야함
    public Page<BoardResponse> myPost(int page, int size, String sortBy, String order) {
        Long userKey = SecurityUtil.getCurrentUserIdOrThrow();
        User user = userRepository.findById(userKey)
                .orElseThrow(() -> new EntityNotFoundException("해당 유저를 찾을 수 없습니다"));

        // 정렬시 기본값 설정, 페이지에 처음 접근할때
        if (sortBy == null || sortBy.isEmpty()) {
            sortBy = "createdAt";  // 기본적으로 최신순
        }
        if (order == null || order.isEmpty()) {
            order = "DESC";  // 기본적으로 내림차순
        }

        Sort sort = Sort.by(Sort.Direction.fromString(order), sortBy);
        Pageable pageable = PageRequest.of(page - 1, size, sort);
        Page<Board> boards = boardRepository.findByUserKey(user.getUserKey(), pageable);

        // 게시글 목록을 BoardResponse 로 변환하여 반환
        return boards.map(board -> {

            // 각 게시글에 대한 댓글, 좋아요, 싫어요 수 가져오기
            int commentCnt = commentRepository.countCommentsByBoardId(board.getId()); // 수정
            int likeCnt = boardReactionRepository.countLikesByBoardId(board.getId()); // 수정
            int dislikeCnt = boardReactionRepository.countDislikesByBoardId(board.getId()); // 수정

            // BoardResponse 로 변환하여 반환
            return BoardResponse.ofPost(board, commentCnt, likeCnt, dislikeCnt);
        });

    }

    // Report 게시글 목록 서비스 구현 (해당 로직 요청시 시작값 status = INACTIVE / ACTIVE 로 설정 해줘야함)
    // Report 게시글 목록 서비스 구현 (해당 로직 요청 시 status = INACTIVE / ACTIVE 로 설정해야 함)
    public Page<ReportResponse> myReportList(int page, int size, String sortBy, String order, String status) {
        Long userKey = SecurityUtil.getCurrentUserIdOrThrow();
        User user = userRepository.findById(userKey)
                .orElseThrow(() -> new EntityNotFoundException("해당 유저를 찾을 수 없습니다"));

        // 기본 정렬 설정
        if (sortBy == null || sortBy.isEmpty()) {
            sortBy = "createdAt";
        }
        if (order == null || order.isEmpty()) {
            order = "DESC";
        }
        Sort sort = Sort.by(Sort.Direction.fromString(order), sortBy);
        Pageable pageable = PageRequest.of(page - 1, size, sort);

        // status 가 null 또는 빈 문자열일 경우 INACTIVE 상태로 설정
        Status reportStatus = (status == null || status.isEmpty()) ? Status.INACTIVE : Status.valueOf(status);

        // Specification 생성 (userKey 와 status 필터링)
        Specification<ReportBoard> spec = createSpecificationReport(user.getUserKey(), reportStatus);

        // 페이징, 정렬된 ReportBoard 조회
        Page<ReportBoard> reportBoards = reportRepository.findAll(spec, pageable);

        return reportBoards.map(ReportResponse::ofReportPostList);
    }

    // userKey 와 status 에 따라 동적으로 조건을 추가하는 Specification (Report)
    private static Specification<ReportBoard> createSpecificationReport(Long userKey, Status status) {
        return (root, query, criteriaBuilder) -> {
            Predicate predicate = criteriaBuilder.conjunction();

            if (userKey != null) {
                predicate = criteriaBuilder.and(predicate, criteriaBuilder.equal(root.get("user").get("userKey"), userKey));
            }

            if (status != null) {
                predicate = criteriaBuilder.and(predicate, criteriaBuilder.equal(root.get("status"), status));
            }

            return predicate;
        };
    }


    // 내 신고작성 게시글 확인
    public ReportResponse myReportPost(long reportId) {
        Long userKey = SecurityUtil.getCurrentUserIdOrThrow();
        User user = userRepository.findById(userKey)
                .orElseThrow(() -> new EntityNotFoundException("해당 유저를 찾을 수 없습니다"));
        ReportBoard reportBoard = reportRepository.findById(reportId)
                .orElseThrow(() -> new EntityNotFoundException("해당 게시글을 찾을 수 없습니다"));
        if (!Objects.equals(user.getUserKey(), reportBoard.getUser().getUserKey())) {
            throw new AccessDeniedException("당신은 이 글에 대한 열람 권한이 없습니다.");
        }
        return ReportResponse.ofOneReportPost(reportBoard);
    }

    // 내 멘토 목록 보기
    public PaginationResponse myMentorList(Long userKey, int currentPage, int size) {
        Pageable pageable = PageRequest.of(currentPage - 1, size);
        int totalItems = mentorRepository.countMentorsByUserKey(userKey);
        int totalPages = (int) Math.ceil((double) totalItems / size);

        if (currentPage < 1) currentPage = 1;
        if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;

        List<MentoringListResponse> mentoringList = mentorRepository.findMentorsByUserKey(userKey, pageable);

        return PaginationResponse.builder()
                .totalItems(totalItems)
                .totalPages(totalPages)
                .size(size)
                .currentPage(currentPage)
                .mentoringListItemBox(mentoringList)
                .build();
    }

    // 내가 작성한 멘토링글 정보
    public PaginationResponse myMentoringPost(Long userKey, int currentPage, int size) {
        Pageable pageable = PageRequest.of(currentPage - 1, size);
        int totalItems = mentorRepository.countMentorsByMentorUserKey(userKey); // 수정된 메서드 사용
        int totalPages = (int) Math.ceil((double) totalItems / size);

        if (currentPage < 1) currentPage = 1;
        if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;

        List<MentoringListResponse> mentoringList = mentorRepository.findMentorPostsByUserKey(userKey, pageable); // 수정된 쿼리 사용

        return PaginationResponse.builder()
                .totalItems(totalItems)
                .totalPages(totalPages)
                .size(size)
                .currentPage(currentPage)
                .mentoringListItemBox(mentoringList)
                .build();
    }

    // 내 멘티 목록 보기
    public PaginationResponse myMenteeList(Long userKey, int currentPage, int size) {
        Pageable pageable = PageRequest.of(currentPage - 1, size);
        int totalItems = mentorRepository.countMenteesByUserKey(userKey);
        int totalPages = (int) Math.ceil((double) totalItems / size);

        if (currentPage < 1) currentPage = 1;
        if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;

        List<MentoringListResponse> mentoringList = mentorRepository.findMenteesByUserKey(userKey, pageable);

        return PaginationResponse.builder()
                .totalItems(totalItems)
                .totalPages(totalPages)
                .size(size)
                .currentPage(currentPage)
                .mentoringListItemBox(mentoringList)
                .build();
    }

    // 유저가 작성한 Report 게시판에서의 관리자 답변 보기
    public Page<ReportCommentResponse> listReportComment(Long reportId, int page, int size, String sortBy, String order) {
        Long userKey = SecurityUtil.getCurrentUserIdOrThrow();
        User user = userRepository.findById(userKey)
                .orElseThrow(() -> new EntityNotFoundException("해당 유저를 찾을 수 없습니다."));
        ReportBoard reportBoard = reportRepository.findById(reportId)
                .orElseThrow(() -> new EntityNotFoundException("해당 게시글을 찾을 수 없습니다."));
        if (!user.getUserKey().equals(reportBoard.getUser().getUserKey())) {
            throw new AccessDeniedException("댓글을 열람 할 권한이 없습니다.");
        }
        if (sortBy == null || sortBy.isEmpty()) {
            sortBy = "createdAt";  // 기본적으로 최신순
        }
        if (order == null || order.isEmpty()) {
            order = "ASC";  // 기본적으로 내림차순
        }
        Sort sort = Sort.by(Sort.Direction.fromString(order), sortBy);
        Pageable pageable = PageRequest.of(page - 1, size, sort);
        Page<ReportComment> reportComments = reportCommentRepository.findByReportBoard_Id(reportId, pageable);
        return reportComments.map(ReportCommentResponse::ofAdminReply);
    }

    // 내 신고 글 삭제
    public Boolean deleteMyReportPost(Long reportId) {
        Long userKey = SecurityUtil.getCurrentUserIdOrThrow();
        User user = userRepository.findById(userKey)
                .orElseThrow(() -> new EntityNotFoundException("해당 유저를 찾을 수 없습니다."));
        ReportBoard reportBoard = reportRepository.findById(reportId)
                .orElseThrow(() -> new EntityNotFoundException("해당 게시글을 찾을 수 없습니다."));
        if (!reportBoard.getUser().getUserKey().equals(user.getUserKey())){
            throw new AccessDeniedException("당신은 이 글을 삭제 할 권한이 없습니다.");
        }
        reportRepository.deleteById(reportId);
        return true;
    }
    public boolean connectGoogleEmail(String authorizationHeader){
        String token = authorizationHeader.replace("Bearer ", ""); // Bearer 제거
        jwtUtil.getAuthentication(token); // 인증 정보 생성
        Long id = jwtUtil.extractUserId(token); // 토큰에서 ID 추출
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("회원이 존재하지 않습니다."));
        String googelemail = user.getGoogleemail();
        if(googelemail == null) {return false;}
        else return true;
    }

    public boolean connectKakaoEmail(String authorizationHeader){
        String token = authorizationHeader.replace("Bearer ", ""); // Bearer 제거
        jwtUtil.getAuthentication(token); // 인증 정보 생성
        Long id = jwtUtil.extractUserId(token); // 토큰에서 ID 추출
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("회원이 존재하지 않습니다."));
        String kakaoemail = user.getKakaoemail();
        if(kakaoemail == null) {return false;}
        else return true;
    }

    public boolean connectNaverEmail(String authorizationHeader){
        String token = authorizationHeader.replace("Bearer ", ""); // Bearer 제거
        jwtUtil.getAuthentication(token); // 인증 정보 생성
        Long id = jwtUtil.extractUserId(token); // 토큰에서 ID 추출
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("회원이 존재하지 않습니다."));
        String naveremail = user.getNaveremail();
        if(naveremail == null) {return false;}
        else return true;
    }

    // 회원탈퇴 OTP 삭제로직 추가
    public Boolean deleteMyAccount() {
        Long userKey = SecurityUtil.getCurrentUserIdOrThrow();
        User user = userRepository.findById(userKey)
                .orElseThrow(() -> new EntityNotFoundException("해당 유저를 찾을 수 없습니다."));
        emailValidationRepository.deleteByUserKey(user.getUserKey());
        tokenRepository.deleteByUserKey(user.getUserKey());
        userRepository.deleteById(user.getUserKey());
        try {
            DeleteByQueryRequest request = DeleteByQueryRequest.of(d -> d
                    .index("board_index")
                    .query(q -> q
                            .term(t -> t
                                    .field("userKey")
                                    .value(userKey.toString()))));
            DeleteByQueryResponse response = elasticsearchClient.deleteByQuery(request);

            // NullPointException 이 발생 할 수 있기 때문에 예외처리를 해야 함
            // 후에 결과값을 서버에 전달
            long deletedCount = Objects.requireNonNullElse(response.deleted(), 0L);
            if (deletedCount > 0) {
                log.info("Elasticsearch 에서 해당 UserKey {} 의 {} 개의 문서 삭제", userKey, deletedCount);
            } else {
                log.warn("Elasticsearch 에서 해당 userKey {} 가 작성한 문서는 없습니다", userKey);
            }
        } catch (IOException ex) {
            throw new ElasticException("엘라스틱 문서 삭제중 에러 발생");
        }
        return true;
    }
}
