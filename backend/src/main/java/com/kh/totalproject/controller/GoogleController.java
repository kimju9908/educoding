package com.kh.totalproject.controller;

import com.kh.totalproject.dto.request.GoogleLoginRequest;
import com.kh.totalproject.dto.request.LoginRequest;
import com.kh.totalproject.dto.request.AdminRequest;
import com.kh.totalproject.dto.request.UserRequest;
import com.kh.totalproject.dto.response.TokenResponse;
import com.kh.totalproject.dto.response.UserResponse;
import com.kh.totalproject.entity.Token;
import com.kh.totalproject.entity.User;
import com.kh.totalproject.repository.TokenRepository;
import com.kh.totalproject.repository.UserRepository;
import com.kh.totalproject.service.AuthService;
import com.kh.totalproject.service.GoogleService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@CrossOrigin(origins = "http://localhost:3000")  // React 개발 서버에서 오는 요청을 허용 (CORS 설정)
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class GoogleController {
    private final UserRepository userRepository;
    private final TokenRepository tokenRepository;
    private final GoogleService googleService;  // GoogleService 의존성 주입

    // 구글 로그인 처리 (DTO 사용)
    @PostMapping("/google/login")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleLoginRequest googleLoginRequest, HttpServletResponse response) {
        String googleToken = googleLoginRequest.getToken();  // 구글 토큰을 받아옴
        if (googleToken == null || googleToken.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "구글 토큰이 누락되었습니다."));
        }

        try {
            // 구글 로그인 처리
            TokenResponse tokenResponse = googleService.login(googleToken, response);

            // 응답 데이터 준비
            Map<String, String> result = new HashMap<>();
            result.put("grantType", "Bearer");
            result.put("accessToken", tokenResponse.getAccessToken());
            result.put("refreshToken", tokenResponse.getRefreshToken());
            result.put("isNewUser", String.valueOf(tokenResponse.isNewUser()));

            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            log.error("구글 로그인 처리 중 오류 발생: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("구글 로그인 처리 중 오류 발생: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "구글 인증 실패"));
        }
    }

    // 공통 에러 핸들링 로직 (HttpClientErrorException 예외 처리)
    @ExceptionHandler(HttpClientErrorException.class)
    public ResponseEntity<String> handleHttpClientError(HttpClientErrorException e) {
        log.error("HttpClientErrorException 발생: {}", e.getMessage());
        return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
    }

    // 공통 에러 핸들링 로직 (IllegalArgumentException 예외 처리)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(IllegalArgumentException e) {
        log.error("IllegalArgumentException 발생: {}", e.getMessage());
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}
