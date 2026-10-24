package com.kh.totalproject.service;

import com.kh.totalproject.entity.User;
import com.kh.totalproject.repository.UserRepository;
import com.kh.totalproject.util.CustomUserDetails;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
// CustomUserDetailService 는 Spring Security 에서 자동 호출 되는 Service
// 동작 흐름
// 1. 사용자가 로그인 요청
// 2. Spring Security 의 AuthenticationManger 가 요청 처리, CustomUserDetailService 호출
// 3. CustomUserDetailService 는 데이터베이스에서 사용자 정보 조회, CustomUserDetails 객체 반환
// 4. Spring Security 는 반환된 CustomUserDetails 를 사용하여 인증 과정 완료, Security Context 에 저장
public class CustomUserDetailService implements UserDetailsService {

    private final UserRepository userRepository;


    @Override
    public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found : " + userId));

        return new CustomUserDetails(
                user.getUserId(),
                user.getEmail(),
                user.getNickname(),
                user.getUserKey(),
                user.getPassword(), // 비밀번호 포함
                Collections.singleton(new SimpleGrantedAuthority(user.getRole().toString()))
        );
    }
}
