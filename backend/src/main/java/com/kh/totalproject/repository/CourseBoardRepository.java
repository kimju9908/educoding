package com.kh.totalproject.repository;

import com.kh.totalproject.entity.CourseBoard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseBoardRepository extends JpaRepository<CourseBoard, Long>, JpaSpecificationExecutor<CourseBoard> {
}

