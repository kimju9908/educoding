package com.kh.totalproject.entity;

import com.kh.totalproject.constant.codechallenge.enums.CodeChallengeDifficulty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;


@Entity
@Getter
@Setter
@ToString
public class CodeChallenge {
    /*
    * data.sql 파일로 초기 레코드 값을 직접 관리합니다.
    */
    @Id
    private Long challengeId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private String cond;

    @Column(nullable = true)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CodeChallengeDifficulty difficulty;

    @Column(nullable = false)
    private Float memoryLimitMb;

    @Column(nullable = false)
    private Integer timeLimitMs;
}
