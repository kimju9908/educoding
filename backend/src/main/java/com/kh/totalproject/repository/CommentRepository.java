package com.kh.totalproject.repository;

import com.kh.totalproject.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    int countByBoardId(long boardId);
    Page<Comment> findByBoardId(Long boardId, Pageable pageable);

    @Query("SELECT COUNT(c) FROM Comment c WHERE c.board.id = :boardId")
    int countCommentsByBoardId(@Param("boardId") Long boardId);
}
