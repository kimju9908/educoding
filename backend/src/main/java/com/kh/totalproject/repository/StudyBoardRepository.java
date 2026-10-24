package com.kh.totalproject.repository;

import com.kh.totalproject.entity.StudyBoard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface StudyBoardRepository extends JpaRepository<StudyBoard, Long>, JpaSpecificationExecutor<StudyBoard> {
}