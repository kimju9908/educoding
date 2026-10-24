package com.kh.totalproject.repository;

import com.kh.totalproject.constant.BoardType;
import com.kh.totalproject.constant.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomBoardRepository {
    Page<Object[]> findAllWithDynamicFilters(BoardType type, Status status, String sortBy, String order,
                                             String enumFilter, String search, Pageable pageable);
}
