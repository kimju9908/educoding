package com.kh.totalproject.dto.response;


import com.kh.totalproject.constant.Role;
import com.kh.totalproject.entity.User;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserResponse {
    private Long userKey;
    private String userId;
    private String email;
    private String nickname;
    private long postCnt;
    private Role role;
    private LocalDateTime registeredAt;
    private LocalDateTime updatedAt;
    private String profileUrl;
    private String introduction;

    // 내정보 보기 읽기전용 OfAll
    public static UserResponse ofMyProfile(User user, int postCntByUser) {
        return UserResponse.builder()
                .userKey(user.getUserKey())
                .userId(user.getUserId())
                .postCnt(postCntByUser)
                .email(user.getEmail())
                .nickname(user.getNickname())
                .role(user.getRole())
                .registeredAt(user.getRegisteredAt())
                .updatedAt(user.getUpdatedAt())
                .profileUrl(user.getProfileUrl())
                .introduction(user.getIntroduction())
                .build();
    }

    public static UserResponse ofOtherUserProfile(User user, int postCntByUser) {
        return UserResponse.builder()
                .postCnt(postCntByUser)
                .nickname(user.getNickname())
                .registeredAt(user.getRegisteredAt())
                .profileUrl(user.getProfileUrl())
                .introduction(user.getIntroduction())
                .build();
    }

    // 이메일을 통한 ID 찾기시 읽기전용 OfUserId
    public static UserResponse ofUserId(User user) {
        return UserResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .build();
    }

    // 관리자가 모든 유저를 체크 할 수 있는 빌더처리
    public static UserResponse ofAllUserInfo(User user) {
        return UserResponse.builder()
                .userKey(user.getUserKey())
                .userId(user.getUserId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .registeredAt(user.getRegisteredAt())
                .profileUrl(user.getProfileUrl())
                .role(user.getRole())
                .build();
    }

    // 관리자 프로필
    public static UserResponse ofAdminProfile(User user) {
        return UserResponse.builder()
                .userKey(user.getUserKey())
                .userId(user.getUserId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .role(user.getRole())
                .registeredAt(user.getRegisteredAt())
                .updatedAt(user.getUpdatedAt())
                .profileUrl(user.getProfileUrl())
                .build();
    }
}
