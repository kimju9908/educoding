package com.kh.totalproject.dto.response;

import com.kh.totalproject.entity.StudyLesson;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudyLessonResponse {
    private Long lessonId;
    private Long chapterId;
    private String language;
    private String chapterKey;
    private String chapterTitle;
    private String lessonKey;
    private String label;
    private Integer sortOrder;
    private String content; // 마크다운 (비어 있으면 준비 중)
    private LocalDateTime updatedAt;

    public static StudyLessonResponse of(StudyLesson lesson) {
        return StudyLessonResponse.builder()
                .lessonId(lesson.getLessonId())
                .chapterId(lesson.getChapter().getChapterId())
                .language(lesson.getChapter().getLanguage())
                .chapterKey(lesson.getChapter().getChapterKey())
                .chapterTitle(lesson.getChapter().getTitle())
                .lessonKey(lesson.getLessonKey())
                .label(lesson.getLabel())
                .sortOrder(lesson.getSortOrder())
                .content(lesson.getContent() == null ? "" : lesson.getContent())
                .updatedAt(lesson.getUpdatedAt())
                .build();
    }
}
