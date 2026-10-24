package com.kh.totalproject.repository;

import com.kh.totalproject.constant.BoardType;
import com.kh.totalproject.dto.response.BoardResponse;
import com.kh.totalproject.entity.Board;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


@Repository
public interface BoardRepository extends JpaRepository<Board, Long>, JpaSpecificationExecutor<Board> {
    long countByUserUserKey(Long userId);

    @Query("SELECT b.user.userKey, b.user.nickname, b.user.profileUrl, COUNT(b) " +
            "FROM Board b " +
            "GROUP BY b.user.userKey, b.user.nickname, b.user.profileUrl " +
            "ORDER BY COUNT(b) DESC")
    List<Object[]> findTopUsersByPostCount(Pageable pageable);

    @Query("SELECT b, b.user.nickname, b.user.profileUrl, b.viewCnt, b.commentCnt, b.likeCnt " +
            "FROM Board b " +
            "WHERE b.createdAt BETWEEN :startDate AND :endDate " +
            "ORDER BY (b.likeCnt * 0.7 + b.viewCnt * 0.3) DESC")
    List<Object[]> findWeeklyPopularPosts(@Param("startDate") LocalDateTime startDate,
                                          @Param("endDate") LocalDateTime endDate,
                                          Pageable pageable);

    @Query("SELECT b FROM Board b WHERE b.user.userKey = :userKey")
    Page<Board> findByUserKey(@Param("userKey") Long userKey, Pageable pageable);

    @Query("SELECT b.viewCnt FROM Board b WHERE b.id = :boardId")
    int countViewsByBoardId(@Param("boardId") Long boardId);
}