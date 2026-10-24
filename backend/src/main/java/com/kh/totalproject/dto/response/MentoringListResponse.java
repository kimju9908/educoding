package com.kh.totalproject.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class MentoringListResponse {

    private Long mentoringId;
    private String mentoringNickname;
    private String mentoringProfileUrl;
    private String mentoringEmail;
    private LocalDateTime mentoringCreatedAt;
    private String mentoringPosition;
    private String mentoringCareer;
    private String mentoringPrice;
    private Double mentoringRating;
    private String mentoringTitle;
    private String mentoringContent;
    private String mentoringHour;
    private Long mentorId; // 멘티 목록 보기에서 리뷰창 이동할때만 사용, 멘토글 id
    private boolean hasReview; // 멘티 목록 보기에서 리뷰창 이동할때만 사용, 백엔드에서 리뷰 여부 포함


}
