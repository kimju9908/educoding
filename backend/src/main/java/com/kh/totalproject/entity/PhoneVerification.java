package com.kh.totalproject.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 회원가입용 휴대폰 인증번호. 번호당 한 건만 유지하고, 인증을 통과하면 verified=true로 두었다가
 * 실제 회원가입이 끝나는 시점에 삭제한다(인증 한 번으로 여러 계정을 만들지 못하게).
 */
@Entity
@Table(name = "phone_verification")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhoneVerification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String phoneNumber;

    @Column(nullable = false, length = 6)
    private String code;

    // 인증번호 유효 시간 (인증 통과 후에는 가입 가능 시간으로 연장)
    @Column(nullable = false)
    private LocalDateTime expiresAt;

    // 재발송 쿨다운 계산용
    @Column(nullable = false)
    private LocalDateTime sentAt;

    @Builder.Default
    @Column(nullable = false)
    private Boolean verified = false;
}
