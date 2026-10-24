package com.kh.totalproject.dto.response;

import com.kh.totalproject.entity.User;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
@Slf4j
public class TokenResponse {
    private String grantType;
    private String accessToken; // Access Token
    private String refreshToken; // Refresh Token
    private String profileUrl;
    private boolean isNewUser;  // 신규 사용자 여부 추가
    private Long userKey; // userKey 필드 추가
    private LocalDateTime registeredAt;

    public static TokenResponse ofAccessToken(TokenResponse tokenresponse, User user) {
        log.info("사용자 정보: userKey={}, profileUrl={}", user.getUserKey(), user.getProfileUrl());
        return TokenResponse.builder()
                .grantType(tokenresponse.getGrantType())
                .accessToken(tokenresponse.getAccessToken())
                .profileUrl(user.getProfileUrl())
                .userKey(user.getUserKey())  // userKey 추가
                .registeredAt(user.getRegisteredAt())
                .build();
    }

}
