package com.kh.totalproject.exception;

import com.kh.totalproject.constant.webhook.FlaskApiPath;
import com.kh.totalproject.dto.response.ErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.client.RestClientException;

import java.util.Map;

/**
 * 기본적으로 Spring Security는 처리되지 않은 예외를 401로 처리합니다. (ResponseStatusException 등 일부 제외)
 * 따라서 보다 의미있는 응답을 보장하고, 실패 상황에 따른 응답을 간편하게 처리하기 위해 예외 핸들러를 사용합니다.
 */
@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {
    private final String FLASK_ERROR_DEFAULT_MESSAGE = "서버 내부 통신 과정에서 알 수 없는 오류가 발생하였습니다";

    @ExceptionHandler(UnauthenticatedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthenticatedException(UnauthenticatedException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Unauthorized"));
    }

    /**
     * Flask 4XX 응답 처리
     * RestTemplate에서 4xx 응답 수신 시 HttpClientErrorException를
     * HttpClientErrorException에 requestUrl 정보를 래핑한 커스텀 예외 사용
     * requestUrl과 flask의 응답 코드에 따라 react 클라이언트에게 적절한 에러 응답 반환
     */
    @ExceptionHandler(CustomHttpClientErrorException.class)
    public ResponseEntity<ErrorResponse> handleHttpClientErrorException(CustomHttpClientErrorException ex) {
        int statusCode = ex.getStatusCode().value();
        String url = ex.getRequestUrl();

        if (url.contains(FlaskApiPath.CREATE_JOB)) {
            return this.handleSubmitError(statusCode);
        }

        else if (url.contains(FlaskApiPath.EXECUTE_JOB)) {
            return this.handleExecuteError(statusCode);
        }

        else if (url.contains(FlaskApiPath.CANCEL_JOB)) {
            return this.handleCancelError(statusCode);
        }

        return ResponseEntity.internalServerError().body(new ErrorResponse(FLASK_ERROR_DEFAULT_MESSAGE));
    }

    /**
     * Flask 5XX 응답 처리
     * HttpServerErrorException에 requestUrl 정보를 래핑한 커스텀 예외 사용
     */
    @ExceptionHandler(CustomHttpServerErrorException.class)
    public ResponseEntity<ErrorResponse> handleHttpServerErrorException(CustomHttpServerErrorException ex) {
        log.error("Flask 서버 내부에서 오류가 발생하였습니다", ex);
        return ResponseEntity.internalServerError().body(new ErrorResponse(FLASK_ERROR_DEFAULT_MESSAGE));
    }

    /**
     * Flask 응답 본문 형식이 기대하는 형식이 아닐 경우 사용하는 Custom 예외
     */
    @ExceptionHandler(InvalidResponseBodyException.class)
    public ResponseEntity<ErrorResponse> handleFlaskResponseIsNotValidException(InvalidResponseBodyException ex) {
        log.error("InvalidResponseBodyException: {}", ex.getMessage());
        return ResponseEntity.internalServerError().body(new ErrorResponse(FLASK_ERROR_DEFAULT_MESSAGE));
    }

    /**
     * Flask 응답 본문 파싱 실패 시 사용하는 Custom 예외
     */
    @ExceptionHandler(CustomHttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleCustomHttpMessageNotReadableException(CustomHttpMessageNotReadableException ex) {
        log.error("{}", ex.getMessage(), ex.getOriginalException());
        return ResponseEntity.internalServerError().body(new ErrorResponse(FLASK_ERROR_DEFAULT_MESSAGE));
    }

    /**
     * RestTemplate 최상위 예외 처리
     *   - 응답이 없는 경우
     *   - 알 수 없는 HTTP 상태 코드 등
     */
    @ExceptionHandler(RestClientException.class)
    public ResponseEntity<ErrorResponse> handleRestClientException (RestClientException ex) {
        log.error("외부 통신 과정에서 처리되지 않은 예외가 발생하였습니다", ex);

        return ResponseEntity.internalServerError().body(new ErrorResponse(FLASK_ERROR_DEFAULT_MESSAGE));

    }

    // 500 Internal Server Error (예상치 못한 오류)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleServerError(Exception ex) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("status", 500, "message", "서버 내부 오류가 발생했습니다", "success", false));
    }

    /*******************************************
     * Flask 4xx/5xx 응답 시 클라이언트(React)에게
     * 적절히 응답하기 위한 Helper 메서드
     *******************************************/
    private ResponseEntity<ErrorResponse> handleSubmitError(int statusCode) {
        String errorMessage = switch (statusCode) {
            case 400 -> "요청 본문이 유효하지 않습니다";
            case 404 -> "존재하지 않는 코딩 테스트 문제입니다";
            case 422 -> "동시 채점은 회원 당 최대 2개로 제한됩니다";
            default -> FLASK_ERROR_DEFAULT_MESSAGE;
        };

        return ResponseEntity.status(statusCode).body(new ErrorResponse(errorMessage));
    }

    private ResponseEntity<ErrorResponse> handleExecuteError(int statusCode) {
        String errorMessage = switch (statusCode) {
            case 400 -> "요청 본문이 유효하지 않습니다";
            case 404 -> "존재하지 않는 작업입니다";
            default -> FLASK_ERROR_DEFAULT_MESSAGE;
        };

        return ResponseEntity.status(statusCode).body(new ErrorResponse(errorMessage));
    }

    private ResponseEntity<ErrorResponse> handleCancelError(int statusCode) {
        String errorMessage = switch (statusCode) {
            case 400 -> "요청 본문이 유효하지 않습니다";
            case 404 -> "존재하지 않는 작업입니다";
            default -> FLASK_ERROR_DEFAULT_MESSAGE;
        };

        return ResponseEntity.badRequest().body(new ErrorResponse(errorMessage));
    }
}