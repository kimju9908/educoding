/* 회원가입, 아이디, 비밀번호 찾기시 필요한 데이터 전송 Dto
*  otp 추가 되었음 */
package com.kh.totalproject.dto.request;

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
public class UserRequest {
    private Long userKey;
    private String userId;
    private String email;
    private String password;
    private String nickname;
    private String profileUrl;
    private String introduction;
    private Integer otp;
    // 회원가입 추가 항목 (이름, 생년월일 yyyy-MM-dd, 휴대폰)
    private String name;
    private java.time.LocalDate birthDate;
    private String phoneNumber;

    // User 저장 시 password 는 암호화하여 데이터베이스 저장
    public User toEntity(PasswordEncoder passwordEncoder) {
        return User.builder()
                .userId(userId)
                .password(passwordEncoder.encode(password))
                .email(email)
                .nickname(nickname)
                .name(name)
                .birthDate(birthDate)
                .profileUrl(profileUrl)
                .build();
    }

    public User toModifyProfile(User existingData) {
        return User.builder()
                .userKey(existingData.getUserKey())
                .userId(existingData.getUserId())
                .password(existingData.getPassword())
                .email(existingData.getEmail())
                .nickname(nickname != null ? nickname : existingData.getNickname())
                .profileUrl(existingData.getProfileUrl())
                .introduction(introduction != null ? introduction : existingData.getIntroduction())
                .role(existingData.getRole())
                // 프로필 수정 시 새 객체로 덮어쓰므로 가입 정보가 지워지지 않게 그대로 옮김
                .name(existingData.getName())
                .birthDate(existingData.getBirthDate())
                .phoneNumber(existingData.getPhoneNumber())
                .build();
    }
}
