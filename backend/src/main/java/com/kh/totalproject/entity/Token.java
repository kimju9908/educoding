package com.kh.totalproject.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.stereotype.Component;

@Entity
@Component
@Table(name = "token")  // 기존 이름 유지
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class Token {
    @Id
    @Column(name = "token_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String refreshToken;

    @OneToOne(cascade = CascadeType.PERSIST)
    @JoinColumn(nullable = false, name = "user_key", referencedColumnName = "user_key")
    private User user;
}
