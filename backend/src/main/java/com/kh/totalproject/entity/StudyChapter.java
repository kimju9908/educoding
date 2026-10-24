package com.kh.totalproject.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * 언어공부 챕터 (예: Java의 "02. 기본 자료형과 연산자").
 * 예전에는 프론트 util/study/*StudyChapter.ts에 하드코딩돼 있던 목록.
 */
@Entity
@Table(
        name = "study_chapter",
        uniqueConstraints = @UniqueConstraint(columnNames = {"language", "chapterKey"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudyChapter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long chapterId;

    // java, c, cplus, javascript, python (URL 경로 /study/{language} 와 동일한 값)
    @Column(nullable = false, length = 30)
    private String language;

    // URL에 쓰이는 챕터 번호 ("02")
    @Column(nullable = false, length = 10)
    private String chapterKey;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private Integer sortOrder;

    @OneToMany(mappedBy = "chapter", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    @Builder.Default
    private List<StudyLesson> lessons = new ArrayList<>();
}
