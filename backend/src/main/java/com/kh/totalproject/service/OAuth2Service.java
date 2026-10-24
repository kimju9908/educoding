package com.kh.totalproject.service;

import com.kh.totalproject.dto.response.TokenResponse;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.oauth2.core.user.OAuth2User;

public interface OAuth2Service {
    TokenResponse login(String accessToken, HttpServletResponse response);
    OAuth2User validateAndExtractUserInfo(String token);
}
