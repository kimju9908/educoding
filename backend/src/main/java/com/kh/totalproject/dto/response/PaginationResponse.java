package com.kh.totalproject.dto.response;

import lombok.*;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class PaginationResponse {

    private int totalItems; // 총 아이템 수
    private int totalPages; // 총 페이지 수
    private int size; // Page 크기
    private int currentPage; // 현재 Page

    private List<MentorResponse> mentorItemBox; // 멘토 항목 리스트
    private List<MentorReviewResponse> reviewItemBox; // 멘토 item 리뷰 항목 리스트
    private List<MentoringListResponse> mentoringListItemBox; // 멘토링 목록 리스트

}
