package com.kh.totalproject.dto.callbackevent;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

// RequestBody를 역직렬화 하기 위한 최소한의 요구사항으로
// 기본 생성자와 setter를 설정
// + 값을 사용하기 위해 getter 추가
@Setter
@Getter
@NoArgsConstructor
@ToString(callSuper = true) // 로깅용
public class JudgeJobResultPassed extends JudgeJobResult {
    private Float maxMemoryUsageMb;
    private Integer maxElapsedTimeMs;
}
