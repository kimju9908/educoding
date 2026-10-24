package com.kh.totalproject.service;

import com.kh.totalproject.constant.MentorTag;
import com.kh.totalproject.dto.MailBody;
import com.kh.totalproject.dto.request.MentorPostRequest;
import com.kh.totalproject.dto.response.MentorResponse;
import com.kh.totalproject.dto.response.PaginationResponse;
import com.kh.totalproject.entity.Mentor;
import com.kh.totalproject.entity.MentorReview;
import com.kh.totalproject.entity.User;
import com.kh.totalproject.exception.DuplicateResourceException;
import com.kh.totalproject.repository.MentorRepository;
import com.kh.totalproject.repository.MentorReviewRepository;
import com.kh.totalproject.repository.UserRepository;
import io.github.cdimascio.dotenv.Dotenv;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor // final 이나 nonNull
@Transactional
public class MentorService {

    private final MentorRepository mentorRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final MentorReviewRepository mentorReviewRepository;

    // ✅ -> 갯수에 따라 Mentor Main Page 불러오는 진행 순서--------------------------------------------------------------------------------------------------------
    // ⑴ 전체 Mentor content Box 조회 (검색 및 정렬 조건 추가) ✅
    public PaginationResponse getAllMentorItemBox (int currentPage, int size, String searchKeyword, String sortType, String tag) {
        // 정렬조건
        Pageable pageable = getSortPageable(currentPage, size, sortType);
        // 검색조건
        Page<Mentor> mentorPage = getMentorPage(searchKeyword, tag, pageable);

        return convertToPaginationResponse(mentorPage);
    }

    // ⑵ 정렬 조건을 설정하는 메서드 ✅✅
    private Pageable getSortPageable(int currentPage, int size, String sortType) {
        try {
            // 정렬 조건에 따른 Pageable 반환
            if ("createdAt".equalsIgnoreCase(sortType)) { // 신규멘토순
                return PageRequest.of(currentPage - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            } else if ("menteeCount".equalsIgnoreCase(sortType)) { // 멘티많은순
                return PageRequest.of(currentPage - 1, size, Sort.by(Sort.Direction.DESC, "menteeCount"));
            } else if ("rating".equalsIgnoreCase(sortType)) { // 평점순
                return PageRequest.of(currentPage - 1, size, Sort.by(Sort.Direction.DESC, "rating"));
            } else {
                return PageRequest.of(currentPage - 1, size); // 기본순
            }
        } catch (Exception error) {
            // 예외 발생시 로그 기록
            System.out.println("Error: " + error.getMessage());
            // 예외 발생시 기본 정렬 조건 반환
            return  PageRequest.of(currentPage -1, size);
        }
    }

    // ⑶ 검색 조건을 설정하는 메서드 ✅✅✅
    private Page<Mentor> getMentorPage(String searchKeyword, String tag, Pageable pageable) {
        try {
            Specification<Mentor> spec = Specification.where(null);

            if (searchKeyword != null && !searchKeyword.trim().isEmpty()) {
                spec = spec.and((root, query, cb) -> {
                    Predicate titlePredicate = cb.like(root.get("title"), "%" + searchKeyword + "%");
                    Predicate contentPredicate = cb.like(root.get("content"), "%" + searchKeyword + "%");
                    Predicate positionPredicate = cb.like(root.get("position"), "%" + searchKeyword + "%");
                    Predicate careerPredicate = cb.like(root.get("career"), "%" + searchKeyword + "%");
                    Predicate currentJobPredicate = cb.like(root.get("currentJob"), "%" + searchKeyword + "%");
                    Predicate tagPredicate = cb.like(root.get("tag"), "%" + searchKeyword + "%");
                    return cb.or(titlePredicate, contentPredicate, positionPredicate, careerPredicate, currentJobPredicate, tagPredicate);
                });
            }

            if (tag != null && !tag.trim().isEmpty()) {
                spec = spec.and((root, query, cb) -> cb.like(root.get("tag"), "%" + tag + "%"));
            }

            Page<Mentor> result = mentorRepository.findAll(spec, pageable);
            return result;
        } catch (Exception error) {
            log.error("Error during query execution: {}", error.getMessage(), error);
            return mentorRepository.findAll(pageable);
        }
    }

    // ⑷ Mentor 데이터를 PaginationResponse(로) 변환하는 메서드 ✅✅✅✅
    public PaginationResponse convertToPaginationResponse (Page<Mentor> mentorPage) {
        // 페이지네이션 객체 생성 후 필드에 값 설정
        PaginationResponse response = new PaginationResponse();
        response.setTotalItems((int) mentorPage.getTotalElements()); // 전체 아이템 수
        response.setTotalPages(mentorPage.getTotalPages()); // 총 페이지 수
        response.setSize(mentorPage.getSize()); // 한 페이지의 크기
        response.setCurrentPage(mentorPage.getNumber() + 1); // 현재 페이지 번호 (1부터 시작)

        // 페이지네이션 객체에 MentorResponse(가) 담긴 리스트 추가
        List<MentorResponse> mentorResponses = mentorPage.getContent().stream()
                .map(mentor -> {
                    String nickname = (mentor.getUser().getNickname() != null) ? mentor.getUser().getNickname() : "Unknown"; // null 체크 후 기본값 설정
                    String profileUrl = (mentor.getUser().getProfileUrl() != null) ? mentor.getUser().getProfileUrl() : "Unknown"; // null 체크 후 기본값 설정
                    return MentorResponse.ofPagination(mentor.getId(), mentor.getTitle(), mentor.getPosition(),
                            mentor.getCareer(), mentor.getCurrentJob(), mentor.getRating(), mentor.getMenteeCount(), mentor.getCreatedAt(), nickname, profileUrl);
                })
                .collect(Collectors.toList());

        response.setMentorItemBox(mentorResponses); // MentorResponse 리스트를 PaginationResponse(에) 설정

        return response;
    }

    // 멘토 모달창 Data 조회 관련-------------------------------------------------------------------------------------------------------------------------------------------
    // 선택 Mentor Modal Detail Data 조회
    public MentorResponse getMentorModalDetailData(Long mentorId) {
        Mentor mentor = mentorRepository.findById(mentorId)
                .orElseThrow(()->new RuntimeException("해당하는 MentorId를 찾지 못했습니다." + mentorId)); // Mentor(가) 없으면 예외 처리

        // MentorResponse 객체를 생성하여 필요한 데이터를 설정
        return MentorResponse.ofModalDetail(
                mentor.getId(), // 멘토 Id
                mentor.getTitle(), // 페이지 제목
                mentor.getPosition(), // 멘토 직무
                mentor.getCareer(), // 멘토 경력
                mentor.getCurrentJob(), // 멘토 현재 직업
                mentor.getMenteeCount(), // 신청 수락한 멘티 수
                mentor.getUser().getNickname(), // 멘토 닉네임
                mentor.getUser().getProfileUrl(), // 멘토 프로필 사진
                mentor.getContent(), // 멘토 페이지 내용
                mentor.getHour(), // 진행 시간
                mentor.getPrice(), // 진행 금액
                mentor.getTag(), // 태그
                mentor.getUser().getUserKey() // 해당 유저의 글 본인 글이 맞는지 확인 여부에 사용
        );
    }

    // Mentor Post Delete---------------------------------------------------------------------------------------------------------------------------------
    public void deleteMentor(Long mentorId) {
        Mentor mentor = mentorRepository.findById(mentorId)
                .orElseThrow(() -> new IllegalArgumentException("Mentor not found with id: " + mentorId));
        // User 엔터티에서 mentor 참조 끊기
        User user = mentor.getUser();
        if (user != null) {
            user.setMentor(null);
        }
        mentorRepository.delete(mentor);
    }

    // Mentor Post Write 관련---------------------------------------------------------------------------------------------------------------------------------
    // Mentor Post Data DB에 등록
    public MentorPostRequest saveMentorPost(MentorPostRequest request) {
        // request 객체가 null인지 확인
        if (request == null) {
            throw new DuplicateResourceException("Request object cannot be null");
        }

        // request에서 필요한 필드 추출
        String title = request.getTitle();
        String position = request.getPosition();
        String career = request.getCareer();
        String currentJob = request.getCurrentJob();
        String content = request.getContent();
        List<MentorTag> tag = request.getTag() != null ? request.getTag() : Collections.emptyList(); // null 방지
        String hour = request.getHour();
        String price = request.getPrice();
        Long userKey = request.getUserKey(); // 유저의 PK를 받음


        // userKey가 null인지 확인
        if (userKey == null) {
            throw new IllegalArgumentException("UserKey cannot be null");
        }

        // userKey로 User 객체 조회 (DB에서 User를 조회)
        User user = userRepository.findByUserKey(userKey)
                .orElseThrow(() -> new IllegalArgumentException("User not found with userKey: " + userKey));

        // Mentor가 이미 존재하는지 확인
        Optional<Mentor> existingMentor = mentorRepository.findByUser_UserKey(userKey);
        if (existingMentor.isPresent()) {
            throw new DuplicateResourceException("작성글이 이미 등록되어 있습니다.");
        }

        // 서버 시간으로 createdAt 설정
        LocalDateTime createdAt = LocalDateTime.now();

        // Mentor 객체 생성 시 User 객체를 외래키로 설정
        Mentor mentor = new Mentor(title, position, content, career, currentJob, tag, hour, price, createdAt, user);

        // Mentor 객체 저장
        Mentor savedMentor = mentorRepository.save(mentor);

        // MentorPostRequest 객체에 저장된 정보 채우기
        return new MentorPostRequest(
                savedMentor.getTitle(),
                savedMentor.getPosition(),
                savedMentor.getContent(),
                savedMentor.getCareer(),
                savedMentor.getCurrentJob(),
                savedMentor.getTag(),
                savedMentor.getHour(),
                savedMentor.getPrice(),
                savedMentor.getCreatedAt(),
                savedMentor.getUser().getUserKey()

        );
    }

    // Mentor Post Data -> DB 저장 (수정)
    public MentorPostRequest modifyMentorPost(MentorPostRequest request) {
        // 1. mentorId로 기존 게시물 조회
        Optional<Mentor> optionalMentor = mentorRepository.findById(request.getMentorId());
        if (!optionalMentor.isPresent()) {
            throw new IllegalArgumentException("해당 멘토 게시물이 존재하지 않습니다: " + request.getMentorId());
        }

        // 2. 기존 게시물 업데이트
        Mentor mentor = optionalMentor.get();
        mentor.setTitle(request.getTitle());
        mentor.setPosition(request.getPosition());
        mentor.setContent(request.getContent());
        mentor.setCareer(request.getCareer());
        mentor.setCurrentJob(request.getCurrentJob());
        mentor.setTag(request.getTag());
        mentor.setHour(request.getHour());
        mentor.setPrice(request.getPrice());

        // 3. 업데이트된 데이터 저장
        mentorRepository.save(mentor);

        // 4. 응답 데이터 반환
        return request;
    }

    // 멘토 글 작성 중 미리보기 기능 관련 (사용자 닉네임과 프로필 )
    public MentorResponse getMentorModalPreviewData(Long userKey) {
        User user = userRepository.findById(userKey)
                .orElseThrow(()->new RuntimeException("해당하는 MentorId를 찾지 못했습니다." + userKey)); // Mentor(가) 없으면 예외 처리

        return MentorResponse.ofPreview(
                user.getNickname(),
                user.getProfileUrl()
    );
    }

    // 멘토 신청하기 버튼 클릭시 발송되는 이메일 관련
    public Boolean sendMentorApplicationEmail(Long mentorId, Long menteeKey, String applyMenteeText) {

        User user = userRepository.findById(menteeKey)
                .orElseThrow(()-> new EntityNotFoundException("해당 유저를 찾을 수 없습니다."));
        Mentor mentor = mentorRepository.findById(mentorId)
                .orElseThrow(()-> new EntityNotFoundException("해당 멘토를 찾을 수 없습니다."));

        String menteeName = user.getNickname();
        String mentorEmail = mentor.getUser().getEmail();
        String mentorNickname = mentor.getUser().getNickname();
        String styledApplyMenteeText = applyMenteeText
                .replace("<p>", "<p style=\"font-size: 16px; line-height: 1.6; text-align: center; margin: 10px 0;\">");

        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

        String DOMAIN_URL = dotenv.get("DOMAIN_URL", System.getenv("DOMAIN_URL"));

        // 동적 링크 생성
        String baseUrl = DOMAIN_URL +"/acceptMentor"; // 기본 URL
        String acceptLink = baseUrl + "/" + mentorId + "/" + menteeKey;

        String htmlContent = "<div style=\"max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; border: 1px solid #ddd; border-radius: 10px; text-align: center;\">"
                + "<h1 style=\"color:#800080; text-align: center; margin: 0 0 20px 0; padding: 0;\">멘토 신청 알림</h1>"
                + "<p style=\"font-size: 16px; line-height: 1.6; text-align: center; margin: 0 0 10px 0; padding: 0;\">안녕하세요, <strong>" + mentorNickname + "</strong>님!</p>"
                + "<p style=\"font-size: 16px; line-height: 1.6; text-align: center; margin: 0 0 10px 0; padding: 0;\"><strong>" + menteeName + "</strong>님이 멘토링을 신청하셨습니다.</p>"
                + styledApplyMenteeText
                + "<p style=\"font-size: 16px; line-height: 1.6; text-align: center; margin: 0 0 20px 0; padding: 0;\">신청을 확인하시고 응답 부탁드립니다!</p>"
                + "<div style=\"text-align: center; margin: 0 auto;\">"
                + "<a href=\"" + acceptLink + "\" style=\"display: inline-block; padding: 10px 20px; background-color: #800080; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;\">수락</a>"
                + "</div>"
                + "<p style=\"font-size: 14px; color: #999; text-align: center; margin: 20px 0 0 0; padding: 0;\">본 이메일은 자동으로 발송되었습니다.</p>"
                + "</div>";

        MailBody mailBody = MailBody.builder()
                .to(mentorEmail)
                .html(htmlContent)
                .subject("새로운 멘토링 신청이 도착했습니다!")
                .build();

        try {
            emailService.sendVerificationEmail(mailBody);
            return true;
        } catch (Exception e) {
            log.error("멘토 신청 이메일 발송 실패: {}", e.getMessage());
            return false;
        }
    }

    // Mentee Review 작성 권한 부여 및 이메일 발송
    public Boolean grantForMenteeReview(Long mentorId, Long menteeKey) {

        User user = userRepository.findById(menteeKey)
                .orElseThrow(() -> new EntityNotFoundException("해당 유저를 찾을 수 없습니다."));

        Mentor mentor = mentorRepository.findById(mentorId)
                .orElseThrow(() -> new EntityNotFoundException("해당 멘토를 찾을 수 없습니다."));

        // 이미 권한이 부여되었는지 확인 (레코드 존재 여부)
        Optional<MentorReview> existingReview = mentorReviewRepository.findByUser_UserKeyAndMentor_Id(user.getUserKey(), mentor.getId());
        if (existingReview.isPresent()) {
            log.info("이미 리뷰 작성 권한이 부여되었습니다: menteeKey={}, mentorId={}", menteeKey, mentorId);
            return true; // 이미 레코드 있으면 성공 처리
        }

        // MentorReview 엔티티 생성
        MentorReview mentorReview = new MentorReview();
        mentorReview.setUser(user);
        mentorReview.setMentor(mentor);
        mentorReviewRepository.save(mentorReview);

        // 멘토의 멘티 수 증가
        mentor.setMenteeCount(mentor.getMenteeCount() + 1);
        mentorRepository.save(mentor);

        // 리뷰 작성 권한 이메일 전송
        sendReviewPermissionEmail(mentorId, menteeKey);

        return true;
    }

    // 멘토가 신청 수락시 멘티에게 자동 메일 송부
    private void sendReviewPermissionEmail(Long mentorId, Long menteeKey) {
        User mentee = userRepository.findById(menteeKey).orElseThrow();
        Mentor mentor = mentorRepository.findById(mentorId).orElseThrow();
        String menteeEmail = mentee.getEmail();
        String mentorNickname = mentor.getUser().getNickname();

        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

        String DOMAIN_URL = dotenv.get("DOMAIN_URL", System.getenv("DOMAIN_URL"));

        // 리뷰 작성 링크 생성
        String reviewLink = DOMAIN_URL + "/community/mentor?mentor_id=" + mentorId + "&modalType=rating";

        String htmlContent = "<div style=\"max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif;\">"
                + "<h1 style=\"color: #800080;\">멘토 신청이 수락되었습니다.</h1>"
                + "<p>안녕하세요, <strong>" + mentee.getNickname() + "</strong>님!</p>"
                + "<p><strong>" + mentorNickname + "</strong> 멘토에 대한 리뷰 작성 권한이 부여되었습니다.</p>"
                + "<p>리뷰를 작성하여 경험을 공유해 주세요!</p>"
                + "<a href=\"" + reviewLink + "\" style=\"display: inline-block; padding: 10px 20px; "
                + "background-color: #800080; color: white; text-decoration: none; border-radius: 5px; "
                + "margin-top: 20px;\">리뷰 작성하러 가기</a>"
                + "</div>";

        MailBody mailBody = MailBody.builder()
                .to(menteeEmail)
                .html(htmlContent)
                .subject("리뷰 작성 권한이 부여되었습니다")
                .build();

        try {
            emailService.sendVerificationEmail(mailBody);
            log.info("리뷰 권한 부여 이메일 발송 성공: menteeKey={}, mentorId={}", menteeKey, mentorId);
        } catch (Exception e) {
            log.error("리뷰 권한 부여 이메일 발송 실패: {}", e.getMessage());
        }
    }

}
