package com.kh.totalproject.repository;

import com.kh.totalproject.entity.Board;
import com.kh.totalproject.entity.ReportBoard;
import com.kh.totalproject.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<ReportBoard, Long>, JpaSpecificationExecutor<ReportBoard> {
    boolean existsByUserAndBoard(User user, Board board);

    @Query("SELECT r FROM ReportBoard r WHERE r.board.id = :boardId AND r.id = :reportId")
    Optional<ReportBoard> findByBoardIdAndReportId(@Param("boardId") Long boardId, @Param("reportId") Long reportId);
}
