package com.kh.totalproject.constant.codehint;

// 풀이 시도 1건의 힌트 진행 상태 (CodeHintAttempt에서 계산, 저장하지 않음)
public enum CodeHintStatus {
    READY,       // 다음 단계를 요청할 수 있음 (또는 모든 단계 공개 완료)
    GENERATING,  // 다음 단계 힌트 생성 중
    FAILED       // 직전 생성 실패 -- 단계는 소비되지 않았고, 같은 단계를 다시 요청하면 재시도
}
