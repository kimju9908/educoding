package com.kh.totalproject.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Entity
@Table(name="otp_verification_for_join")   // Table 이름 지정, Table 이름은 소문자, 카멜 표기법은 -> Snake 표기법으로 변경 됨
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString   // 오버라이딩
@Builder
public class OtpVerificationForJoin {
    @Id // 해당 필드를 PK로 지정
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 기본키 생성 전략, JPA 가 자동으로 생성 전략을 정함 예) 시퀀스 생성
    private Long id;    // PK
    private Integer otp;
    private Date expirationDate;
    @Column(unique = true, nullable = false)
    private String email;
    // 인증번호 확인을 통과했는지 — 회원가입 시 이 값이 true인 기록이 있어야 가입 가능 (가입 후 삭제)
    @Builder.Default
    private Boolean verified = false;
}
