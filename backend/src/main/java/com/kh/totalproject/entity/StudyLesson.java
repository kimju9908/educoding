package com.kh.totalproject.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 언어공부 강의 한 편. 본문은 마크다운(content)으로 저장하고 프론트가 렌더링한다.
 * content가 비어 있으면 "준비 중인 강의"로 표시된다.
 */
@Entity
@Table(
        name = "study_lesson",
        uniqueConstraints = @UniqueConstraint(columnNames = {"chapter_id", "lessonKey"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudyLesson {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long lessonId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "chapter_id", nullable = false)
    private StudyChapter chapter;

    // URL에 쓰이는 강의 번호 ("01")
    @Column(nullable = false, length = 10)
    private String lessonKey;

    // 목록에 보이는 이름 ("01. 변수와 자료형")
    @Column(nullable = false)
    private String label;

    @Column(nullable = false)
    private Integer sortOrder;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String content;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
