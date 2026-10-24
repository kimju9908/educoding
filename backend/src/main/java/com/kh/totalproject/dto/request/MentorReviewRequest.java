package com.kh.totalproject.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MentorReviewRequest {

    private Long mentorId;
    private Long menteeKey;
    private String reviewText;
    private Double rating;
}
