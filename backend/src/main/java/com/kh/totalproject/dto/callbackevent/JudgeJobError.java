package com.kh.totalproject.dto.callbackevent;

/**
 * Webhook Callback RequestBody를 역직렬화 할 때 사용하는 DTO record입니다.
 * record 클래스는 다음의 특징을 가집니다.
 *   - 불변(immutable) 객체로 스레드 안전성 보장
 *   - equals(), hashCode(), toString() 메서드 자동 생성
 *   - 각 필드에 대한 접근자(getter)" 자동 생성
 * record 클래스는 역직렬화 되는 과정이 일반 클래스와 약간 다릅니다.
 *   - record: JSON → 필드 값 추출 → AllArgsConstructor 호출하여 직접 객체 생성 → 완성된 객체
 *   - class: JSON → 기본 생성자로 빈 객체 생성 → Setter로 각 필드 값 설정 → 완성된 객체
 */
public record JudgeJobError(String jobId, String error) {
}
