package com.kh.totalproject.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StudyChapterRequest {
    private String language; // 생성 시에만 사용 (수정 시 무시)
    private String chapterKey;
    private String title;
    private Integer sortOrder;
}
