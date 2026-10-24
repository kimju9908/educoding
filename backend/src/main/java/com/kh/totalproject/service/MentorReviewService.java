package com.kh.totalproject.service;

import com.kh.totalproject.dto.request.MentorReviewRequest;
import com.kh.totalproject.dto.response.MentorReviewResponse;
import com.kh.totalproject.dto.response.PaginationResponse;
import com.kh.totalproject.entity.Mentor;
import com.kh.totalproject.entity.MentorReview;
import com.kh.totalproject.entity.User;
import com.kh.totalproject.exception.DuplicateResourceException;
import com.kh.totalproject.repository.MentorRepository;
import com.kh.totalproject.repository.MentorReviewRepository;
import com.kh.totalproject.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class MentorReviewService {

    private final MentorReviewRepository mentorReviewRepository;
    private final MentorRepository mentorRepository;
    private final UserRepository userRepository;

    // 해당 멘토의 모든 리뷰 반환 (최신순 정렬)
    public List<MentorReviewResponse> getReviewData(Long mentorId) {
        // 멘토 존재 여부 확인
        Mentor mentor = mentorRepository.findById(mentorId)
                .orElseThrow(() -> new IllegalArgumentException("멘토를 찾을 수 없습니다."));

        // 멘토 ID로 모든 리뷰 조회 (최신순 정렬)
        List<MentorReview> reviews = mentorReviewRepository.findByMentor_IdOrderByCreatedAtDesc(mentorId);

        // DTO 변환 및 조건 필터링 (리뷰 내용이 있고, 평점이 1 이상인 경우만)
        return reviews.stream()
                .filter(review -> review.getReviewText() != null && review.getRating() >= 1) // 조건 추가
                .sorted(Comparator.comparing(MentorReview::getCreatedAt).reversed()) // 최신순 정렬
                .map(review -> new MentorReviewResponse(
                        review.getId(),
                        review.getMentor().getId(),
                        review.getUser().getUserKey(),
                        review.getReviewText(),
                        review.getRating(),
                        review.getCreatedAt(),
                        review.getUser().getProfileUrl(),
                        review.getUser().getNickname()))
                .collect(Collectors.toList());
    }

    // 해당 멘토의 멘티인지 유무 확인
    public boolean menteeCheck(Long mentorId, Long menteeKey) {
        Mentor mentor = mentorRepository.findById(mentorId).orElseThrow(() -> new IllegalArgumentException("멘토를 찾을 수 없습니다."));
        User user = userRepository.findById(menteeKey).orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        return mentorReviewRepository.existsByMentorAndUser(mentor, user);
    }

    // 리뷰 등록
    public Boolean reviewSubmit(MentorReviewRequest request) {
        // 1. Mentor(와) User 존재 여부 확인
        Mentor mentor = mentorRepository.findById(request.getMentorId())
                .orElseThrow(() -> new EntityNotFoundException("해당 멘토를 찾을 수 없습니다."));
        User user = userRepository.findById(request.getMenteeKey())
                .orElseThrow(() -> new EntityNotFoundException("해당 멘티를 찾을 수 없습니다."));

        // 2. 유효성 검사
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new IllegalArgumentException("별점은 1에서 5 사이여야 합니다.");
        }
        if (request.getReviewText() == null || request.getReviewText().trim().isEmpty()) {
            throw new IllegalArgumentException("리뷰 내용이 필요합니다.");
        }
        if (request.getReviewText().length() > 200) {
            throw new IllegalArgumentException("리뷰 내용은 200를 넘을 수 없습니다.");
        }

        // 3. 기존 리뷰가 있는지 확인
        MentorReview existingReview = mentorReviewRepository.findByUser_UserKeyAndMentor_Id(user.getUserKey(), mentor.getId())
                .orElseThrow(() -> new EntityNotFoundException("해당 멘토에 대한 리뷰 작성 권한이 없습니다."));

        // 4. 이미 리뷰가 작성되어 있다면 메시지 반환
        if (existingReview.getReviewText() != null && !existingReview.getReviewText().trim().isEmpty()) {
            throw new DuplicateResourceException("이미 리뷰가 작성되어 있습니다.");
        }

        // 5. 리뷰 내용, 별점, 생성 시간 업데이트
        existingReview.setReviewText(request.getReviewText());
        existingReview.setRating(request.getRating());
        existingReview.setCreatedAt(LocalDateTime.now()); // 생성 시간을 현재로 갱신 (필요한 경우)

        // 6. 리뷰 업데이트
        mentorReviewRepository.save(existingReview);

        // 멘토의 평균 rating 갱신
        updateMentorAverageRating(request.getMentorId());

        // 7. 응답 생성
        return true;
    }

    // 리뷰 삭제
    public void updateReviewToDeleted(Long reviewId, double rating, String reviewText) {
        // 리뷰 존재 여부 확인
        MentorReview review = mentorReviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("해당 리뷰를 찾을 수 없습니다. reviewId: " + reviewId));

        // 리뷰 수정
        review.setRating(rating); // rating을 0으로 설정
        review.setReviewText(reviewText); // reviewText를 null로 설정

        // 변경 사항 저장
        mentorReviewRepository.save(review);

        // 멘토의 평균 rating 갱신
        updateMentorAverageRating(review.getMentor().getId());
    }


    // 멘토 rating 평점 갱신 메서드
    private void updateMentorAverageRating(Long mentorId) {
        List<MentorReview> reviews = mentorReviewRepository.findByMentor_Id(mentorId);
        double averageRating = reviews.isEmpty() ? 0.0 :
                reviews.stream().mapToDouble(MentorReview::getRating).sum() / reviews.size();

        Mentor mentor = mentorRepository.findById(mentorId)
                .orElseThrow(() -> new IllegalArgumentException("멘토를 찾을 수 없습니다."));
        mentor.setRating(averageRating);
        mentorRepository.save(mentor);
    }
}
