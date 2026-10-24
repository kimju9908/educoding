package com.kh.totalproject.util;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;

@Slf4j
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException{
        // request 헤더에서 토큰을 문자열로 추출
        String tokenStr = resolveToken(request);

        if (StringUtils.hasText(tokenStr)) {
            try {
                if (jwtUtil.validateToken(tokenStr)) {
                    Authentication authentication = jwtUtil.getAuthentication(tokenStr);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (UsernameNotFoundException e) {
                // 전달된 토큰이 유효하지 않은 DB에 없는 사용자 PK 값을 참조하고 있는 경우
                // (예시: 리프레시 토큰이 브라우저에 남아있지만 DB가 초기화된 경우)
                log.warn("Invalid token found: {}", e.getMessage());

                // 전달된 토큰이 리프레시 토큰인 경우, 브라우저 세션쿠키에서 제거하도록 지시
                if (request.getCookies() != null) {
                    Arrays.stream(request.getCookies())
                            .filter(cookie -> "refreshToken".equals(cookie.getName()))
                            .forEach(cookie -> {
                                cookie.setValue("");
                                cookie.setPath("/");
                                cookie.setMaxAge(0);
                                response.addCookie(cookie);
                                log.info("Invalid refreshToken cookie deleted");
                            });
                }

                // 인증 정보 클리어
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request){
        // 1. Authorization 헤더에서 access 토큰 확인 후 추출
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer")){
            return bearerToken.substring(7);
        }

        // 2. 쿠키에서 refresh 토큰 확인 후 추출
        if (request.getCookies() != null) { // 쿠키 가져오기 추가
            return Arrays.stream(request.getCookies())
                    .filter(cookie -> "refreshToken".equals(cookie.getName()))
                    .map(Cookie::getValue)
                    .findFirst()
                    .orElse(null);
        }
        return null;
    }
}
