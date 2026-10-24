package com.kh.totalproject.repository;

import com.kh.totalproject.entity.TeamBoard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface TeamBoardRepository extends JpaRepository<TeamBoard, Long>, JpaSpecificationExecutor<TeamBoard> {
}

