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
public class MentorReviewResponse {

    private Long reviewId;
    private Long mentorId;
    private Long menteeKey;
    private String reviewText;
    private Double rating;
    private LocalDateTime createdAt;
    private String profileUrl;
    private String nickname;
}
