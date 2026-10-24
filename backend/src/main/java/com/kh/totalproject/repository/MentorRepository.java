package com.kh.totalproject.repository;

import com.kh.totalproject.dto.response.MentoringListResponse;
import com.kh.totalproject.entity.Mentor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MentorRepository extends JpaRepository<Mentor, Long> {
    Page<Mentor> findAll(Specification<Mentor> spec, Pageable pageable);

    Optional<Mentor> findByUser_UserKey(Long userKey);

    // 멘토 수 조회
    @Query("SELECT COUNT(DISTINCT m.id) " +
            "FROM MentorReview mr " +
            "JOIN mr.mentor m " +
            "WHERE mr.user.userKey = :userKey")
    int countMentorsByUserKey(@Param("userKey") Long userKey);

    // 멘토 목록 조회
    @Query("SELECT new com.kh.totalproject.dto.response.MentoringListResponse(" +
            "m.id, u.nickname, u.profileUrl, u.email, MIN(mr.createdAt), " +
            "m.position, m.career, m.price, AVG(mr.rating), m.title, m.content, m.hour, m.id, " +
            "CASE WHEN (mr.reviewText IS NOT NULL OR mr.rating != 0) THEN true ELSE false END) " +
            "FROM MentorReview mr " +
            "JOIN mr.mentor m " +
            "JOIN m.user u " +
            "WHERE mr.user.userKey = :userKey " +
            "GROUP BY m.id, u.nickname, u.profileUrl, u.email, m.position, m.career, m.price, m.title, m.content, m.hour, mr.reviewText, mr.rating " +
            "ORDER BY MIN(mr.createdAt) DESC")
    List<MentoringListResponse> findMentorsByUserKey(@Param("userKey") Long userKey, Pageable pageable);
    // 멘티 수 조회
    @Query("SELECT COUNT(DISTINCT mr.user.userKey) " +
            "FROM MentorReview mr " +
            "JOIN mr.mentor m " +
            "WHERE m.user.userKey = :userKey")
    int countMenteesByUserKey(@Param("userKey") Long userKey);

    // 멘티 목록 조회
    @Query("SELECT new com.kh.totalproject.dto.response.MentoringListResponse(" +
            "u.userKey, u.nickname, u.profileUrl, u.email, MIN(mr.createdAt), " +
            "NULL, NULL, NULL, NULL, NULL, NULL, NULL, m.id, " +
            "CASE WHEN (mr.reviewText IS NOT NULL OR mr.rating != 0) THEN true ELSE false END) " +
            "FROM MentorReview mr " +
            "JOIN mr.mentor m " +
            "JOIN mr.user u " +
            "WHERE m.user.userKey = :userKey " +
            "GROUP BY u.userKey, u.nickname, u.profileUrl, u.email, m.id, mr.reviewText, mr.rating " +
            "ORDER BY MIN(mr.createdAt) DESC")
    List<MentoringListResponse> findMenteesByUserKey(@Param("userKey") Long userKey, Pageable pageable);

    // 수정: Mentor 테이블 기반 멘토 수 조회
    @Query("SELECT COUNT(m) FROM Mentor m WHERE m.user.userKey = :userKey")
    int countMentorsByMentorUserKey(@Param("userKey") Long userKey);

    // 내가 작성한 멘토링글 정보
    @Query("SELECT new com.kh.totalproject.dto.response.MentoringListResponse(" +
            "m.id, u.nickname, u.profileUrl, u.email, m.createdAt, " +
            "m.position, m.career, m.price, m.rating, m.title, m.content, m.hour, m.id, false) " +
            "FROM Mentor m " +
            "JOIN m.user u " +
            "WHERE m.user.userKey = :userKey " +
            "ORDER BY m.createdAt DESC")
    List<MentoringListResponse> findMentorPostsByUserKey(@Param("userKey") Long userKey, Pageable pageable);
}



