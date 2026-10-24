package com.kh.totalproject.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kh.totalproject.constant.Role;
import com.kh.totalproject.dto.response.TokenResponse;
import com.kh.totalproject.entity.Token;
import com.kh.totalproject.entity.User;
import com.kh.totalproject.repository.TokenRepository;
import com.kh.totalproject.repository.UserRepository;
import com.kh.totalproject.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@Service
public class NaverService {

    private final TokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    private static final String NAVER_API_URL = "https://nid.naver.com/oauth2.0/token";  // 네이버 액세스 토큰 요청 URL

    @Value("${naver.client-id}")
    private String clientId;

    @Value("${naver.client-secret}")
    private String clientSecret;

    @Value("${naver.redirect-uri}")
    private String redirectUri;

    public String getAccessTokenFromNaver(String code) {
        String url = NAVER_API_URL;

        // 네이버 액세스 토큰을 요청하는 파라미터를 Map으로 정의
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("code", code);
        params.add("state", "RANDOM_STATE");

        HttpHeaders headers = new HttpHeaders();
        headers.set("Accept", "application/json");

        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(params, headers);

        RestTemplate restTemplate = new RestTemplate();

        // POST 방식으로 네이버 API 요청
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

        // JSON 파싱 후 access_token 추출
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(response.getBody());
            return rootNode.get("access_token").asText();  // access_token 추출
        } catch (Exception e) {
            throw new RuntimeException("네이버 액세스 토큰을 얻는 데 실패했습니다.", e);
        }
    }


    public TokenResponse login(String accessToken) {
        if (accessToken == null || accessToken.isEmpty()) {
            throw new IllegalArgumentException("네이버 액세스 토큰이 유효하지 않습니다.");
        }

        // 네이버 API로 사용자 정보 조회
        String email = getUserInfoFromNaver(accessToken);

        boolean isNewUser = false;

        // 이메일 중복 확인
        User existingUser = userRepository.findByEmail(email).orElse(null);

        if (existingUser != null) {
            // 기존 사용자가 있으면 해당 사용자로 로그인 처리
            log.info("기존 사용자로 로그인");
            return jwtUtil.generateTokenFromUser(existingUser); // 기존 사용자 토큰 생성
        } else {
            // 신규 사용자 생성
            log.info("새로운 사용자로 회원가입");
            isNewUser = true;
            User newUser = createNewMember(email);
            TokenResponse tokenResponse = jwtUtil.generateTokenFromUser(newUser);
            tokenResponse.setNewUser(isNewUser);  // 신규 사용자 여부 추가

            Token token = Token.builder()
                    .refreshToken(tokenResponse.getRefreshToken())
                    .build();
            token.setUser(newUser);

            tokenRepository.save(token);
            return tokenResponse;
        }
    }


    private String getUserInfoFromNaver(String accessToken) {
        String url = "https://openapi.naver.com/v1/nid/me"; // 사용자 정보 조회 URL

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(response.getBody());
            JsonNode responseNode = rootNode.get("response");

            if (responseNode == null) {
                throw new IllegalArgumentException("응답 데이터에서 'response' 노드를 찾을 수 없습니다.");
            }

            String email = responseNode.get("email").asText();
            log.info("네이버 로그인 사용자 이메일: {}", email);

            return email; // 이메일만 반환

        } catch (Exception e) {
            log.error("네이버 사용자 정보 추출 실패", e);
            throw new IllegalArgumentException("네이버 사용자 정보 추출 실패", e);
        }
    }


    private User createNewMember(String email) {
        try {
            log.info("새 사용자 생성 시작");

            // 이메일을 기반으로 사용자 ID 생성
            String usernamePart = email.split("@")[0];  // 이메일 앞부분 추출
            String domainPart = email.split("@")[1].split("\\.")[0];  // 이메일의 도메인 앞부분 추출
            String userId = usernamePart + domainPart;  // 사용자 ID 생성 (이메일 앞부분 + 도메인 앞부분)

            // User 객체 생성 및 정보 설정
            User member = new User();
            member.setEmail(email);
            member.setNaveremail(email);
            member.setUserId(userId);  // 이메일 기반 사용자 ID 설정
            member.setNickname("User_" + UUID.randomUUID().toString().substring(0, 8));  // 랜덤 닉네임 생성
            member.setPassword(null);  // 기본 비밀번호를 NULL로 설정
            member.setRole(Role.USER);  // 기본 역할을 USER로 설정

            log.info("새 사용자 정보 저장: 사용자 ID = {}, 이메일 = {}", userId, email);

            // 새 사용자 DB에 저장 후 반환
            return userRepository.save(member);
        } catch (Exception e) {
            log.error("새 사용자 생성 중 오류 발생: {}", e.getMessage(), e);
            throw new IllegalArgumentException("새 사용자 생성 실패", e);
        }
    }
}
