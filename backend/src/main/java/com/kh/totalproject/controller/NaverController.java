package com.kh.totalproject.controller;

import com.kh.totalproject.dto.response.TokenResponse;
import com.kh.totalproject.service.NaverService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class NaverController {

    private final NaverService naverService;

    // 네이버 로그인 콜백을 받는 부분
    @GetMapping("/naver/callback")
    public void naverCallback(@RequestParam String code, @RequestParam String state, HttpServletResponse response) {
        log.info("🔵 네이버 콜백 실행됨, code: {}, state: {}", code, state);  // ✅ 콘솔 확인용 추가

        try {
            if (code == null || code.isEmpty()) {
                log.error("🚨 네이버 인증 코드가 없음");
                sendErrorScript(response, "네이버 인증 코드가 누락되었습니다.");
                return;
            }

            String accessToken = naverService.getAccessTokenFromNaver(code);
            log.info("🟢 네이버 액세스 토큰 받음: {}", accessToken);  // ✅ 콘솔 확인용 추가

            TokenResponse tokenResponse = naverService.login(accessToken);
            log.info("🟢 네이버 로그인 성공, TokenResponse: {}", tokenResponse);  // ✅ 콘솔 확인용 추가

            sendSuccessScript(response, tokenResponse);
        } catch (Exception e) {
            log.error("🚨 네이버 로그인 처리 중 오류 발생: {}", e.getMessage());
            sendErrorScript(response, "네이버 인증 실패");
        }
    }


    // 성공 시 스크립트를 반환
    private void sendSuccessScript(HttpServletResponse response, TokenResponse tokenResponse) {
        String frontendOrigin = "http://localhost:3000"; // 프론트엔드 도메인
        String script = "<script>" +
                "console.log('네이버 로그인 완료 - 부모 창으로 메시지 전송 시작');" +
                "if (window.opener) {" +
                "    console.log('부모 창이 존재함, 메시지 전송 진행');" +
                "    window.opener.postMessage({" +
                "        success: {" +
                "            grantType: 'Bearer'," +
                "            accessToken: '" + tokenResponse.getAccessToken() + "'," +
                "            refreshToken: '" + tokenResponse.getRefreshToken() + "'," +
                "            isNewUser: " + tokenResponse.isNewUser() +
                "        }" +
                "    }, '" + frontendOrigin + "');" +
                "    console.log('부모 창으로 메시지 전송 완료');" +
                "    window.close();" +
                "} else {" +
                "    console.log('부모 창이 존재하지 않음');" +
                "    alert('부모 창이 존재하지 않습니다. 팝업 창을 닫아주세요.');" +
                "}" +
                "</script>";

        sendScript(response, script);
    }



    // 실패시 스크립트를 반환
    private void sendErrorScript(HttpServletResponse response, String errorMessage) {
        String frontendOrigin = "http://localhost:3000"; // 프론트엔드 도메인
        String script = "<script>" +
                "if (window.opener) {" +
                "    window.opener.postMessage({" +
                "        error: '" + errorMessage + "'" +
                "    }, '" + frontendOrigin + "');" + // 프론트엔드 도메인으로 설정
                "    window.close();" +
                "} else {" +
                "    alert('" + errorMessage + "');" +
                "    window.close();" +
                "}" +
                "</script>";

        sendScript(response, script);
    }

    // 스크립트를 HTTP 응답으로 전송
    private void sendScript(HttpServletResponse response, String script) {
        response.setContentType("text/html;charset=UTF-8");
        try {
            response.getWriter().write(script);
        } catch (IOException e) {
            log.error("응답 스크립트를 작성하는 중 오류 발생: {}", e.getMessage());
        }
    }

    // 오류가 발생한 경우에 대한 공통 응답 반환
    private ResponseEntity<?> badRequestResponse(String errorMessage) {
        return ResponseEntity.badRequest().body(Map.of("error", errorMessage));
    }

    // 응답 맵 생성 공통화
    private Map<String, String> createResponseMap(TokenResponse tokenResponse) {
        Map<String, String> result = new HashMap<>();
        result.put("grantType", "Bearer");
        result.put("accessToken", tokenResponse.getAccessToken());
        result.put("refreshToken", tokenResponse.getRefreshToken());
        result.put("isNewUser", String.valueOf(tokenResponse.isNewUser()));
        return result;
    }
}
