package com.kh.totalproject.dto.flask.request;

import com.kh.totalproject.constant.codechallenge.enums.CodeChallengeLanguage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateJobRequest {
    private CodeChallengeLanguage codeLanguage;
    private String code;
    private Long challengeId;
    private Long userId;
}
