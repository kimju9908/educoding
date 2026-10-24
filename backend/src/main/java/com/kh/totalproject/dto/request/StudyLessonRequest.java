package com.kh.totalproject.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StudyLessonRequest {
    private Long chapterId; // 생성 시 소속 챕터 (수정 시 다른 챕터로 옮길 때도 사용)
    private String lessonKey;
    private String label;
    private Integer sortOrder;
    private String content; // 마크다운
}
