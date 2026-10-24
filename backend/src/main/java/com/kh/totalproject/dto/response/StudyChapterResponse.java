package com.kh.totalproject.dto.response;

import com.kh.totalproject.entity.StudyChapter;
import com.kh.totalproject.entity.StudyLesson;
import lombok.*;

import java.util.List;

/**
 * 챕터 + 강의 목록. 필드 이름(id, title, contents[label, navigatepath, thirdpath])은
 * 예전 프론트 하드코딩 데이터(ChapterType)와 같은 모양으로 맞췄다.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudyChapterResponse {
    private Long chapterId;
    private String id; // chapterKey ("02")
    private String title;
    private Integer sortOrder;
    private List<LessonSummary> contents;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LessonSummary {
        private Long lessonId;
        private String lessonKey;
        private String label;
        private Integer sortOrder;
        private String navigatepath; // "/study/java/02/01"
        private String thirdpath; // 소속 챕터 제목
        private boolean hasContent; // false면 "준비 중인 강의"
    }

    public static StudyChapterResponse of(StudyChapter chapter) {
        return StudyChapterResponse.builder()
                .chapterId(chapter.getChapterId())
                .id(chapter.getChapterKey())
                .title(chapter.getTitle())
                .sortOrder(chapter.getSortOrder())
                .contents(chapter.getLessons().stream().map(l -> summary(chapter, l)).toList())
                .build();
    }

    private static LessonSummary summary(StudyChapter chapter, StudyLesson lesson) {
        return LessonSummary.builder()
                .lessonId(lesson.getLessonId())
                .lessonKey(lesson.getLessonKey())
                .label(lesson.getLabel())
                .sortOrder(lesson.getSortOrder())
                .navigatepath("/study/" + chapter.getLanguage() + "/" + chapter.getChapterKey() + "/" + lesson.getLessonKey())
                .thirdpath(chapter.getTitle())
                .hasContent(lesson.getContent() != null && !lesson.getContent().isBlank())
                .build();
    }
}
