package com.kh.totalproject.dto.callbackevent;
import com.kh.totalproject.constant.codechallenge.enums.CodeChallengeLanguage;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

// RequestBody를 역직렬화 하는 자식 클래스를 위해 최소한의 요구사항으로
// 기본 생성자와 setter를 설정
// + 값을 사용하기 위해 getter 추가
@Setter
@Getter
@NoArgsConstructor
@ToString
public abstract class JudgeJobResult {
    private Long userId;
    private String jobId;
    private Long challengeId;
    private Boolean passed;
    private CodeChallengeLanguage codeLanguage;
    private String code;
    private Integer codeByteSize;
    private LocalDateTime submittedAt;
}
