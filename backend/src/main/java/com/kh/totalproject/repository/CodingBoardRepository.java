package com.kh.totalproject.repository;

import com.kh.totalproject.entity.CodingBoard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface CodingBoardRepository extends JpaRepository<CodingBoard, Long>, JpaSpecificationExecutor<CodingBoard> {
}

