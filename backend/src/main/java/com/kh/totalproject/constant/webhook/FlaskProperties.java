package com.kh.totalproject.constant.webhook;

/**
 * Flask API와의 통신에 필요한 구성 정보를 담는 불변 레코드 클래스입니다.
 * 이 레코드는 Flask 서버의 URL, API 키, 클라이언트 ID와 같은
 * 외부 서비스 연결에 필요한 정보를 캡슐화합니다.
 * record 클래스는 다음의 특징을 가집니다.
 *   - 불변(immutable) 객체로 스레드 안전성 보장
 *   - equals(), hashCode(), toString() 메서드 자동 생성
 *   - 각 필드에 대한 접근자(getter) 자동 생성
 */
public record FlaskProperties(
    String host,        // Flask 서버 호스트 주소
    String apiKey,      // Flask API 호출 시 인증에 사용되는 API 키
    String clientId     // Flask API 호출 시 클라이언트 식별을 위한 ID
) {
    /**
     * 모든 필수 속성이 유효한지 검증하는 컴팩트 생성자입니다.
     * 컴팩트 생성자는 record 클래스 인스턴스를 사용할 때 사용하는 일종의 AllArgConstructor 입니다.
     * 각 필드에 대해 this 키워드를 생략할 수 있고, 매개변수는 자동 대입되며 실제 문법에선 생략됩니다.
     * 보통 객체 생성 과정에서 필요한 필드 검증 로직을 작성합니다.
     *
     * @throws IllegalArgumentException 필수 속성 중 하나라도 비어있거나 null인 경우
     */
    public FlaskProperties {
        if (host == null || host.isEmpty()) {
            throw new IllegalArgumentException("Flask 서버 Host 주소는 필수 값입니다");
        }
        if (apiKey == null || apiKey.isEmpty()) {
            throw new IllegalArgumentException("Flask API Key는 필수 값입니다");
        }
        if (clientId == null || clientId.isEmpty()) {
            throw new IllegalArgumentException("Flask Client ID는 필수 값입니다");
        }
    }
}