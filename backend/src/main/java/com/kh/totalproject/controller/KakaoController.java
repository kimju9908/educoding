package com.kh.totalproject.controller;

import com.google.api.Http;
import com.kh.totalproject.dto.request.KakaoLoginRequest;
import com.kh.totalproject.dto.response.TokenResponse;
import com.kh.totalproject.service.KakaoService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@CrossOrigin(origins = "http://localhost:3000")  // React 개발 서버에서 오는 요청을 허용 (CORS 설정)
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class KakaoController {

    private final KakaoService kakaoService;  // KakaoService 의존성 주입

    // 카카오 로그인 처리 (DTO 사용)
    @PostMapping("/kakao/login")
    public ResponseEntity<?> kakaoLogin(@RequestBody KakaoLoginRequest kakaoLoginRequest, HttpServletResponse response) {
        String kakaoToken = kakaoLoginRequest.getToken();  // DTO에서 카카오 토큰 추출
        if (kakaoToken == null || kakaoToken.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "카카오 토큰이 누락되었습니다."));
        }

        try {
            TokenResponse tokenResponse = kakaoService.login(kakaoToken, response);  // 카카오 로그인 처리
            Map<String, String> result = new HashMap<>();
            result.put("grantType", "Bearer");
            result.put("accessToken", tokenResponse.getAccessToken());
            result.put("refreshToken", tokenResponse.getRefreshToken());
            return ResponseEntity.ok(result);  // 성공적인 응답 반환
        } catch (Exception e) {
            log.error("카카오 로그인 처리 중 오류 발생: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "카카오 인증 실패"));
        }
    }
}
