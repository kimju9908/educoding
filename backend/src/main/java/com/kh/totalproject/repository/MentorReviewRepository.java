package com.kh.totalproject.repository;

import com.kh.totalproject.entity.Mentor;
import com.kh.totalproject.entity.MentorReview;
import com.kh.totalproject.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MentorReviewRepository extends JpaRepository<MentorReview, Long> {
    List<MentorReview> findByMentor_Id(Long mentorId);
    List<MentorReview> findByMentor_IdOrderByCreatedAtDesc(Long mentorId);
    Optional<MentorReview> findByUser_UserKeyAndMentor_Id( Long userKey, Long mentorId);
    boolean existsByMentorAndUser(Mentor mentor, User user);

}
