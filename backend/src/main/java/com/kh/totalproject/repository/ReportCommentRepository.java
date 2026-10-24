package com.kh.totalproject.repository;

import com.kh.totalproject.entity.ReportComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportCommentRepository extends JpaRepository<ReportComment, Long> {
    // JPA 작동원리 자체가 ReportBoard 에서 필드명 id 를 참조하므로 _ 를 명시해야함
    Page<ReportComment> findByReportBoard_Id(Long reportId, Pageable pageable);
}
