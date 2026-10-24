package com.kh.totalproject.service;

import com.kh.totalproject.dto.response.KakaoUserInfoResponse;
import com.kh.totalproject.dto.response.TokenResponse;
import com.kh.totalproject.entity.User;
import com.kh.totalproject.repository.UserRepository;
import com.kh.totalproject.util.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@Service
@Transactional
public class KakaoService implements OAuth2Service {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Override
    public TokenResponse login(String accessToken, HttpServletResponse response) {
        if (accessToken == null || accessToken.isEmpty()) {
            log.error("카카오 액세스 토큰이 유효하지 않습니다.");
            throw new IllegalArgumentException("카카오 액세스 토큰이 유효하지 않습니다.");
        }

        KakaoUserInfoResponse userInfoResponse = getKakaoUserInfo(accessToken);
        if (userInfoResponse == null) {
            log.error("카카오 사용자 정보 가져오기 실패");
            throw new IllegalArgumentException("카카오 사용자 정보 가져오기 실패");
        }

        String email = userInfoResponse.getEmail();

        if (userRepository.existsByEmail(email)) {
            log.info("이미 존재하는 이메일입니다: {}", email);
            throw new IllegalArgumentException("이미 가입된 이메일입니다.");
        }

        User member = createNewMember(userInfoResponse);

        return jwtUtil.generateTokenFromUser(member, response);
    }

    @Override
    public OAuth2User validateAndExtractUserInfo(String accessToken) {
        // 카카오 API에서 사용자 정보를 추출하는 로직
        KakaoUserInfoResponse userInfoResponse = getKakaoUserInfo(accessToken);

        if (userInfoResponse == null) {
            log.error("카카오 사용자 정보 가져오기 실패");
            throw new IllegalArgumentException("카카오 사용자 정보 가져오기 실패");
        }

        String email = userInfoResponse.getEmail();
        String name = userInfoResponse.getName();

        return new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("USER")),
                Map.of("email", email, "name", name),
                "email"
        );
    }

    private KakaoUserInfoResponse getKakaoUserInfo(String accessToken) {
        String kakaoApiUrl = "https://kapi.kakao.com/v2/user/me";

        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + accessToken);

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    kakaoApiUrl,
                    HttpMethod.GET,
                    entity,
                    Map.class
            );

            Map<String, Object> kakaoAccount = (Map<String, Object>) response.getBody().get("kakao_account");
            String email = (String) kakaoAccount.get("email");
            String name = (String) kakaoAccount.get("profile_nickname");

            return new KakaoUserInfoResponse(email, name);

        } catch (Exception e) {
            log.error("카카오 사용자 정보 요청 중 오류 발생: {}", e.getMessage());
            return null;
        }
    }


    private User createNewMember(KakaoUserInfoResponse userInfoResponse) {
        String email = userInfoResponse.getEmail();
        String userId = email.split("@")[0] + UUID.randomUUID().toString().substring(0, 8);

        User member = new User();
        member.setEmail(email);
        member.setUserId(userId);
        member.setNickname("User_" + UUID.randomUUID().toString().substring(0, 8));
        member.setPassword("default_password");

        return userRepository.save(member);
    }
}
