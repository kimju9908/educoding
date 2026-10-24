package com.kh.totalproject.dto.request;

import com.kh.totalproject.constant.codechallenge.enums.CodeChallengeLanguage;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubmitCodeForJudgmentRequest {
    private Long challengeId;
    private CodeChallengeLanguage codeLanguage;
    private String code;
}
