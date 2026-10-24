package com.kh.totalproject.repository;

import com.kh.totalproject.entity.Board;
import com.kh.totalproject.entity.BoardReaction;
import com.kh.totalproject.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BoardReactionRepository extends JpaRepository<BoardReaction, Long> {
    Optional<BoardReaction> findByBoardAndUser(Board board, User user);

    // 특정 게시글에 대한 좋아요 수 카운트
    @Query("SELECT COUNT(br) FROM BoardReaction br WHERE br.board.id = :boardId AND br.reaction = 'LIKE'")
    int countLikesByBoardId(@Param("boardId") Long boardId);

    // 특정 게시글에 대한 싫어요 수 카운트
    @Query("SELECT COUNT(br) FROM BoardReaction br WHERE br.board.id = :boardId AND br.reaction = 'DISLIKE'")
    int countDislikesByBoardId(@Param("boardId") Long boardId);

}
