package com.kh.totalproject.service;

import com.kh.totalproject.constant.Role;
import com.kh.totalproject.dto.response.TokenResponse;
import com.kh.totalproject.entity.Token;
import com.kh.totalproject.entity.User;
import com.kh.totalproject.repository.TokenRepository;
import com.kh.totalproject.repository.UserRepository;
import com.kh.totalproject.util.JwtUtil;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@Service
@Transactional
public class GoogleService implements OAuth2Service {
    private final TokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final MyPageService myPageService;

    public TokenResponse login(String idToken, HttpServletResponse response) {
        if (idToken == null || idToken.isEmpty()) {
            log.error("구글 ID 토큰이 유효하지 않습니다.");
            throw new IllegalArgumentException("구글 ID 토큰이 유효하지 않습니다.");
        }

        // ID Token 검증 및 사용자 정보 추출
        log.info("구글 ID 토큰 검증 시작");
        OAuth2User user = validateAndExtractUserInfo(idToken);  // ID 토큰 검증 및 사용자 정보 추출

        if (user == null) {
            log.error("구글 사용자 정보 가져오기 실패");
            throw new IllegalArgumentException("구글 사용자 정보 가져오기 실패");
        }

        String email = user.getAttribute("email");
        User member;
        boolean isNewUser = false;

        // 이메일 중복 확인 및 연동
        if (userRepository.existsByGoogleemail(email)) {
            // 1. 구글이메일이 이미 데이터베이스에 구글이메일로써 존재할때
            log.info("이미 존재하는 이메일입니다: {}", email);
            // 이미 존재하는 구글 이메일이므로 구글이메일의 정보로 나머지 사용자 정보를 가져와서 member에 대입
            member = userRepository.findByGoogleemail(email)
                    .orElseThrow(() -> new IllegalArgumentException("이미 가입된 이메일입니다."));
            log.info("기존 사용자 정보 가져오기 완료: 사용자 ID = {}", member.getUserId());
            // 2. 구글이메일이 이미 데이터베이스에 존재하지만 구글이메일의 연동을 해제하려고 할 때


        } else {
            // 4. 구글 이메일로의 로그인이 최초일 때 자동 회원가입
            log.info("이메일 {} 로 새로운 사용자 생성", email);
            member = createNewMember(user);
            isNewUser = true;
        }

        // JWT 토큰 생성
        log.info("JWT 토큰 생성 완료");

        // 응답에 isNewUser 값 추가
        TokenResponse tokenResponse = jwtUtil.generateTokenFromUser(member, response);
        tokenResponse.setNewUser(isNewUser); // 신규 사용자 여부 추가

        // 기존 Token이 있으면 업데이트, 없으면 새로 생성
        Token token = tokenRepository.findByUserUserKey(member.getUserKey()).orElse(new Token());
        token.setRefreshToken(tokenResponse.getRefreshToken());
        token.setUser(member);
        log.info("회원 ID (userKey): {}", member.getUserKey());

        tokenRepository.save(token);  // Token 저장

        return tokenResponse;
    }


    public TokenResponse connect(String idToken, HttpServletResponse response, String authorizationHeader) {
        // 토큰에서 사용자 ID 추출
        String tokenB = authorizationHeader.replace("Bearer ", "");
        Long userIdB = jwtUtil.extractUserId(tokenB);
        User member = null;
        OAuth2User user = validateAndExtractUserInfo(idToken);  // ID 토큰 검증 및 사용자 정보 추출

        if (user == null) {
            log.error("구글 사용자 정보 가져오기 실패");
            throw new IllegalArgumentException("구글 사용자 정보 가져오기 실패");
        }

        if (userIdB == null) {
            log.error("JWT 토큰에서 userId를 추출할 수 없습니다.");
            throw new IllegalArgumentException("유효하지 않은 JWT 토큰입니다.");
        }
        boolean isKakaoLinked = myPageService.connectKakaoEmail(authorizationHeader);
        boolean isNaverLinked = myPageService.connectNaverEmail(authorizationHeader);



        // 3. 구글 이메일이 아직 데이터베이스에 존재하지 않지만 기존 계정에 연동하려고 할 때
        if (isKakaoLinked || isNaverLinked) {
            log.info("기존 계정과 구글 이메일을 연동합니다. userId: {}", userIdB);
            member = userRepository.findById(userIdB)
                    .orElseThrow(() -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다. userId: " + userIdB));

            if (member == null) {
                log.error("기존 사용자 정보가 존재하지 않습니다. userId: {}", userIdB);
                throw new IllegalArgumentException("기존 계정 정보가 존재하지 않습니다.");
            }
            updateMember(user, member);
            log.info("기존 계정에 구글 이메일 연동 완료: 사용자 ID = {}", member.getUserId());
        }
        TokenResponse tokenResponse = jwtUtil.generateTokenFromUser(member, response);
        return tokenResponse;
    }



    public OAuth2User validateAndExtractUserInfo(String idToken) {
        try {
            // ID Token을 파싱하여 클레임 추출
            log.info("구글 ID 토큰 파싱 시작");
            SignedJWT signedJWT = SignedJWT.parse(idToken);
            JWTClaimsSet claims = signedJWT.getJWTClaimsSet();

            String email = claims.getStringClaim("email");
            String name = claims.getStringClaim("name");

            if (email == null || name == null) {
                log.error("ID 토큰에 이메일 또는 이름 정보가 없습니다.");
                throw new IllegalArgumentException("ID 토큰에서 사용자 정보를 추출할 수 없습니다.");
            }

            log.info("구글 사용자 정보: 이메일={}, 이름={}", email, name);
            return new DefaultOAuth2User(
                    Collections.singleton(new SimpleGrantedAuthority("USER")),
                    Map.of("email", email, "name", name),
                    "email"
            );
        } catch (ParseException e) {
            log.error("ID 토큰 파싱 실패: 메시지={}", e.getMessage());
            throw new IllegalArgumentException("구글 ID 토큰 검증 실패");
        }
    }

    private User createNewMember(OAuth2User user) {
        log.info("새 사용자 생성 시작");
        User member = new User();
        String email = user.getAttribute("email");
        String usernamePart = email.split("@")[0];
        String domainPart = email.split("@")[1].split("\\.")[0];
        String userId = usernamePart + domainPart;

        member.setEmail(email);
        member.setUserId(userId);  // 이메일 기반 사용자 ID 생성
        member.setNickname("User_" + UUID.randomUUID().toString().substring(0, 8));  // 랜덤 닉네임 생성
        member.setPassword(passwordEncoder.encode(userId + "!!"));  // 기본 비밀번호 생성
        member.setRole(Role.USER);  // 역할을 USER로 설정
        member.setGoogleemail(email);

        log.info("새 사용자 정보 저장: 사용자 ID = {}, 이메일 = {}", userId, email);
        return userRepository.save(member);  // 새 사용자 DB에 저장
    }

    private User updateMember(OAuth2User user, User member) {
        log.info("기존 사용자에 구글이메일 계정 연동 시작");
        String googleemail = user.getAttribute("email");
        String email = member.getEmail();
        String userId = member.getUserId();
        member.setGoogleemail(googleemail);
        log.info("기존 사용자에 구글 소셜 로그인 후 구글이메일 정보 추가저장: 사용자 ID = {}, 기본 이메일 = {},  구글 이메일 = {}", userId, email, googleemail);
        return userRepository.save(member);  // 새 사용자 DB에 저장
    }

    private User deleteMember(User member) {
        log.info("기존 사용자에 구글이메일 계정 연동 해제 시작");
        String googleemail = member.getGoogleemail();
        String deletedgoogleemail = googleemail;
        String userId = member.getUserId();
        if(googleemail != null) {member.setGoogleemail(null);}
        log.info("기존 사용자에 구글 소셜 로그인 연동 해제된 구글이메일: 사용자 ID = {}, 이메일 = {}", userId, deletedgoogleemail);
        return userRepository.save(member);  // 새 사용자 DB에 저장
    }
}
