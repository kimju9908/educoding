package com.kh.totalproject.dto.request;


import com.kh.totalproject.constant.Role;
import com.kh.totalproject.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.crypto.password.PasswordEncoder;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AdminRequest { // 관리자 회원가입 Request Dto
    private String userId;
    private String email;
    private String password;
    private String nickname;
    private Role role; // Admin 회원가입은 userStatus 추가
    // userStatus 값이 null 만 아니면 자동으로 Admin 권한으로 계정 생성됨
    
    // Admin 저장 시 password 는 암호화하여 데이터베이스 저장
    public User toJoinAsAdmin(PasswordEncoder passwordEncoder){
        return User.builder()
                .userId(userId)
                .password(passwordEncoder.encode(password))
                .email(email)
                .nickname(nickname)
                .role(role)
                .build();
    }
}
