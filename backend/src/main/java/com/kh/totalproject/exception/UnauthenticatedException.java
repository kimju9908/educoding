package com.kh.totalproject.exception;

/**
 * SecurityContextHolder에서 현재 권한(Authentication)이나 인증된 사용자 정보(Principal)를 찾을 수 없는 경우에 발생하는 예외입니다.
 * com.kh.totalproject.util.SecurityUtil에서 현재 요청을 시도한 회원에 PK를 얻는 과정에서 사용됩니다.
 * GlobalExceptionHandler에서 이 예외를 잡아 HTTP 401 Unauthorized 상태 코드로 응답할 수 있습니다.
 */
public class UnauthenticatedException extends RuntimeException {

    /**
     * 기본 생성자.
     * 메시지나 원인 없이 새로운 UnauthenticatedException 인스턴스를 생성합니다.
     */
    public UnauthenticatedException() {
        super();
    }

    /**
     * 지정된 상세 메시지를 가지는 UnauthenticatedException을 생성합니다.
     *
     * @param message 예외의 상세 메시지
     */
    public UnauthenticatedException(String message) {
        super(message);
    }

    /**
     * 지정된 상세 메시지와 원인 Throwable을 가지는 UnauthenticatedException을 생성합니다.
     *
     * @param message 예외의 상세 메시지
     * @param cause   예외의 원인(기본 예외)
     */
    public UnauthenticatedException(String message, Throwable cause) {
        super(message, cause);
    }
}
