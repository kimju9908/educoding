package com.kh.totalproject.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch.core.DeleteByQueryRequest;
import co.elastic.clients.elasticsearch.core.DeleteByQueryResponse;
import com.kh.totalproject.constant.Status;
import com.kh.totalproject.dto.request.ReportCommentRequest;
import com.kh.totalproject.dto.response.*;
import com.kh.totalproject.entity.*;
import com.kh.totalproject.exception.DuplicateResourceException;
import com.kh.totalproject.exception.ElasticException;
import com.kh.totalproject.repository.*;
import com.kh.totalproject.util.SecurityUtil;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDate;
import java.util.*;

import static com.kh.totalproject.service.WeeklyTimeCalculator.getEndOfLast7Days;
import static com.kh.totalproject.service.WeeklyTimeCalculator.getStartOfLast7Days;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AdminService {
    private final UserRepository userRepository;
    private final BoardRepository boardRepository;
    private final ReportRepository reportRepository;
    private final ReportCommentRepository reportCommentRepository;
    private final EmailValidationRepository emailValidationRepository;
    private final TokenRepository tokenRepository;
    private final EntityManager entityManager;
    private final PasswordEncoder passwordEncoder;
    private final ElasticsearchClient elasticsearchClient;

    public UserResponse adminProfile() {
        Long userKey = SecurityUtil.isAdminOrThrow();
        User user = userRepository.findById(userKey)
                .orElseThrow(() -> new EntityNotFoundException("해당 유저를 찾을 수 없습니다"));
        return UserResponse.ofAdminProfile(user);
    }

    public Boolean changeEmail(String email) {
        Long userKey = SecurityUtil.isAdminOrThrow();
        User user = userRepository.findById(userKey)
                .orElseThrow(() -> new EntityNotFoundException("해당 유저를 찾을 수 없습니다"));
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("중복된 이메일입니다.");
        }
        user.setEmail(email);
        userRepository.save(user);
        return true;
}

    public Boolean confirmPw(String password) {
        Long userKey = SecurityUtil.isAdminOrThrow();
        User user = userRepository.findById(userKey)
                .orElseThrow(() -> new EntityNotFoundException("해당 유저를 찾을 수 없습니다"));
        String storedPassword = user.getPassword();
        if (storedPassword == null) {
            return true;
        }

        return passwordEncoder.matches(password, storedPassword);
    }

    public Boolean changePw(String password) {
        Long userKey = SecurityUtil.isAdminOrThrow();
        User user = userRepository.findById(userKey)
                .orElseThrow(() -> new EntityNotFoundException("해당 유저를 찾을 수 없습니다"));
        user.setPassword(passwordEncoder.encode(password));
        userRepository.save(user);
        return true;
    }

    public Page<UserResponse> listAllUserInfo(int page, int size, String sortBy, String order, String search) {
        SecurityUtil.isAdminOrThrow();
        // 기본 정렬 설정
        if (sortBy == null || sortBy.isEmpty()) {
            sortBy = "registeredAt";
        }
        if (order == null || order.isEmpty()) {
            order = "DESC";
        }

        // Sort 기본값이 아닌 이상한 값 들어 왔을때 대비한 예외처리 수정
        Sort.Direction direction;
        try {
            direction = Sort.Direction.fromString(order);
        } catch (IllegalArgumentException ex) {
            direction = Sort.Direction.DESC;  // 기본값 설정
        }

        Sort sort = Sort.by(direction, sortBy);
        Pageable pageable = PageRequest.of(page -1, size, sort);

        Specification<User> spec = createSpecification(search);
        Page<User> users = userRepository.findAll(spec, pageable);

        return users.map(UserResponse::ofAllUserInfo);
    }

    // 검색기능 user_id, nickname, email 로 like 검색 가능
    private Specification<User> createSpecification(String search) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isEmpty()) {
                String searchPattern = "%" + search + "%"; // 오타 수정

                predicates.add(cb.or(
                        cb.like(root.get("userId"), searchPattern),
                        cb.like(root.get("nickname"), searchPattern),
                        cb.like(root.get("email"), searchPattern)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    // 유저를 삭제하는 로직 과 동시에 해당 유저가 쓴 글을 엘라스틱 서치에서 삭제
    // DB 에서의 해당 user 가 관련된 글은 기본적으로 Cascade.REMOVE 를 통해 삭제 되지만
    // 엘라스틱은 해당 cascade 가 없기에 수동으로 동기화 작업 필요
    public Boolean deleteUser(List<Long> userKeys) {
        SecurityUtil.isAdminOrThrow();
        List<User> users = userRepository.findByUserKeyIn(userKeys);
        if (users.isEmpty()) {
            throw new EntityNotFoundException("해당 유저를 찾을 수 없습니다");
        }
        // For 구문으로 각각에 해당하는 userKey 를 기반으로 잉여 otp 삭제 및 엘라스틱 동기화
        for (User user : users) {
            emailValidationRepository.deleteByUserKey(user.getUserKey());
            tokenRepository.deleteByUserKey(user.getUserKey());
            userRepository.deleteById(user.getUserKey());
            try {
                DeleteByQueryRequest request = DeleteByQueryRequest.of(d -> d
                        .index("board_index")
                        .query(q -> q
                                .term(t -> t
                                        .field("userKey")
                                        .value(user.getUserKey()))));
                DeleteByQueryResponse response = elasticsearchClient.deleteByQuery(request);

                // NullPointException 이 발생 할 수 있기 때문에 예외처리를 해야 함
                // 후에 결과값을 서버에 전달
                long deletedCount = Objects.requireNonNullElse(response.deleted(), 0L);
                if (deletedCount > 0) {
                    log.info("Elasticsearch 에서 해당 UserKey {} 의 {} 개의 문서 삭제", user.getUserKey(), deletedCount);
                } else {
                    log.warn("Elasticsearch 에서 해당 userKey {} 가 작성한 문서는 없습니다", user.getUserKey());
                }
            } catch (IOException ex) {
                throw new ElasticException("엘라스틱 문서 삭제중 에러 발생");
            }
        }
        return true;
    }

    // Report 게시글 목록 서비스 구현 (해당 로직 요청시 status 값 없으면 ACTIVE 로 기본값)
    public Page<ReportResponse> listReportPost(int page, int size, String sortBy, String order, String status) {

        // 기본 정렬 설정
        if (sortBy == null || sortBy.isEmpty()) {
            sortBy = "createdAt";
        }
        if (order == null || order.isEmpty()) {
            order = "DESC";
        }
        Sort sort = Sort.by(Sort.Direction.fromString(order), sortBy);
        Status reportStatus = (status == null || status.isEmpty()) ? Status.ACTIVE : Status.valueOf(status);
        Pageable pageable = PageRequest.of(page - 1, size, sort);
        Specification<ReportBoard> spec = createSpecificationReport(reportStatus);
        Page<ReportBoard> reportBoards = reportRepository.findAll(spec, pageable);
        return reportBoards.map(ReportResponse::ofReportPostList);
    }

    // Status 별로 정렬을 지정 할 동적 Specification 설정 (Report)
    private static Specification<ReportBoard> createSpecificationReport(Status status) {
        return (root, query, criteriaBuilder) -> {
            Predicate predicate = criteriaBuilder.conjunction();

            if (status != null) {
                predicate = criteriaBuilder.and(predicate, criteriaBuilder.equal(root.get("status"), status));
            }

            return predicate;
        };
    }

    // 관리자가 신고 게시글을 열람 하는 로직
    public ReportResponse getReportPost(Long reportId) {
        SecurityUtil.isAdminOrThrow();
        ReportBoard reportBoard = reportRepository.findById(reportId)
                .orElseThrow(() -> new EntityNotFoundException("해당 게시글을 찾을 수 없습니다"));
        return ReportResponse.ofOneReportPost(reportBoard);
    }

    // 관리자가 유저가 작성한 Report 글을 삭제 할 수 있도록 로직 구현
    public Boolean deleteReportPost(Long reportId) {
        SecurityUtil.isAdminOrThrow();
        ReportBoard reportBoard = reportRepository.findById(reportId)
                .orElseThrow(() -> new EntityNotFoundException("해당 게시글을 찾을 수 없습니다"));
        reportRepository.deleteById(reportBoard.getId());
        return true;
    }

    // 신고글에 대한 답변 리스트
    public Page<ReportCommentResponse> listReportReply(Long reportId, int page, int size, String sortBy, String order) {
        SecurityUtil.isAdminOrThrow();
        // 정렬시 기본값 설정, 페이지에 처음 접근할때
        if (sortBy == null || sortBy.isEmpty()) {
            sortBy = "createdAt";  // 기본적으로 최신순
        }
        if (order == null || order.isEmpty()) {
            order = "DESC";  // 기본적으로 내림차순
        }
        Sort sort = Sort.by(Sort.Direction.fromString(order), sortBy);
        Pageable pageable = PageRequest.of(page - 1, size, sort);
        Page<ReportComment> reportComments = reportCommentRepository.findByReportBoard_Id(reportId, pageable);
        return reportComments.map(ReportCommentResponse::ofAdminReply);
    }

    // 신고글에 답변작성 로직
    public Boolean replyReport(ReportCommentRequest reportCommentRequest) {
        log.info("서버에 처음 들어온 reportId: {}", reportCommentRequest.getReportId());
        Long userKey = SecurityUtil.isAdminOrThrow();
        User user = userRepository.findById(userKey)
                .orElseThrow(() -> new EntityNotFoundException("해당 유저를 찾을 수 없습니다"));
        log.info("User key: {}", user.getUserKey());
        ReportBoard reportBoard = reportRepository.findById(reportCommentRequest.getReportId())
                .orElseThrow(() -> new EntityNotFoundException("해당 게시글을 찾을 수 없습니다"));
        log.info("reportId: {}", reportBoard.getId());
        log.info("commentRequest: {}", reportCommentRequest.getContent());
        ReportComment reportComment = reportCommentRequest.toAddComment(user, reportBoard);
        reportCommentRepository.save(reportComment);
        reportBoard.setStatus(Status.INACTIVE); // 댓글 작성시 자동으로 해당 게시글 INACTIVE 설정
        return true;
    }

    // 관리자 권한으로 유저의 게시글 삭제 (유저 신고글 에서 전달 받은 boardId 를 통해 삭제)
    public Boolean deletePost(Long boardId) {
        SecurityUtil.isAdminOrThrow();
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new EntityNotFoundException("해당 게시물이 존재하지 않습니다"));
        boardRepository.deleteById(board.getId());
        return true;
    }

    public Map<String, Long> weeklyJoinNumberIncrement() {
        SecurityUtil.isAdminOrThrow();

        // 지난 7일 범위 계산
        LocalDate startOfLast7Days = getStartOfLast7Days().toLocalDate();
        LocalDate endOfLast7Days = getEndOfLast7Days().toLocalDate();

        // Criteria API 설정
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Object[]> query = cb.createQuery(Object[].class);
        Root<User> userRoot = query.from(User.class);

        query.multiselect(
                cb.function("DATE", LocalDate.class, userRoot.get("registeredAt")),
                cb.count(userRoot)
        );
        // 데이터 DATE 별 그룹화
        query.groupBy(cb.function("DATE", LocalDate.class, userRoot.get("registeredAt")));
        query.where(cb.between(
                userRoot.get("registeredAt"),
                getStartOfLast7Days(),
                getEndOfLast7Days()
        ));

        List<Object[]> resultList = entityManager.createQuery(query).getResultList();

        // 결과 가공 날짜별로 증가한 회원 수를 Map 에 저장
        Map<String, Long> userIncreaseMap = new LinkedHashMap<>();

        // 지난 7일의 날짜를 미리 초기화 (값은 null)
        LocalDate currentDate = startOfLast7Days;
        while (!currentDate.isAfter(endOfLast7Days)) {
            userIncreaseMap.put(currentDate.toString(), null);
            currentDate = currentDate.plusDays(1);
        }

        // 실제 데이터 덮어쓰기
        for (Object[] result : resultList) {
            LocalDate registeredDate = (LocalDate) result[0];
            Long count = (Long) result[1];
            userIncreaseMap.put(registeredDate.toString(), count);
        }

        return userIncreaseMap;
    }
}
