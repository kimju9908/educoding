package com.kh.totalproject.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Entity
@Table(name="otp_verification")   // Table 이름 지정, Table 이름은 소문자, 카멜 표기법은 -> Snake 표기법으로 변경 됨
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString   // 오버라이딩
@Builder
public class OtpVerification {
    @Id // 해당 필드를 PK로 지정
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 기본키 생성 전략, JPA 가 자동으로 생성 전략을 정함 예) 시퀀스 생성
    @Column(name = "otp_id")
    private Long id;    // PK
    private Integer otp;
    private Date expirationDate;

    @OneToOne(cascade = CascadeType.PERSIST)
    @JoinColumn(name = "user_key", referencedColumnName = "user_key")
    private User user;
}
