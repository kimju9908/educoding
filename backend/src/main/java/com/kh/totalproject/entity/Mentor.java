package com.kh.totalproject.entity;

import com.kh.totalproject.constant.MentorTag;
import com.kh.totalproject.util.MentorTagListConverter;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor

public class Mentor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mentor_id")
    private Long id; // 멘토 ID (PK)

    @Column(name = "title", length = 50 )
    private String title; // 멘토 게시물 제목

    @Column(name = "position", length = 30)
    private String position; // 멘토 직무

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "career", length = 30)
    private String career; // 멘토 경력

    @Column(name = "currentJob", length = 30)
    private String currentJob; // 멘토 현재 직업

    @Column(name = "tag", columnDefinition = "TEXT") // BLOB 대신 TEXT로 변경
    @Convert(converter = MentorTagListConverter.class) // 컨버터 적용
    private List<MentorTag> tag; // 필드명 'tags'로 통일

    @Column(name = "hour", length = 30)
    private String hour; // 진행 시간

    @Column(name = "price", length = 30)
    private String price; // 진행 금액

    @Column(name = "rating")
    private Double rating = 0.0; // 멘토 게시물 평점

    @Column(name = "created_at")
    private LocalDateTime createdAt; // 멘토 게시물 생성 날짜

    @Column(name = "mentee_count")
    private Integer menteeCount = 0; // 신청 수락한 멘티 수

    @OneToOne
    @JoinColumn(name = "userKey", unique = true)
    private User user; // 모든 사용자 (FK)

    public Mentor(String title, String position, String content, String career, String currentJob, List<MentorTag> tag, String hour, String price, LocalDateTime createdAt, User user) {
        this.title = title;
        this.position = position;
        this.content = content;
        this.career = career;
        this.currentJob = currentJob;
        this.tag = tag;
        this.hour = hour;
        this.price = price;
        this.createdAt = createdAt;
        this.user = user;

    }
}
