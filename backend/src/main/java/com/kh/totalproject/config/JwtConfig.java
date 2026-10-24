package com.kh.totalproject.config;



import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtConfig {
    // application properties 에 있는 jwt.secret-key 가져오기
    @Value("${jwt.secret-key}")
    private String secretKey;
    
    // JwtUtil 에서 secret-key 부르기
    public String getSecretKey(){
        return secretKey;
    }
}
