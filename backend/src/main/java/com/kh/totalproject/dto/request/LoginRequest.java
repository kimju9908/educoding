package com.kh.totalproject.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class  LoginRequest {
    private String userId; // 소셜/기존 호환용
    private String email; // 일반 로그인은 이메일로
    private String password;

    // 로그인 요청 객체를 Spring Security 에서 사용할 수 있는 인증 객체로 생성
    public UsernamePasswordAuthenticationToken toAuthentication(){
        return new UsernamePasswordAuthenticationToken(userId, password);
    }
}
