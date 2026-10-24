package com.kh.totalproject.controller;

import com.kh.totalproject.dto.response.StudyChapterResponse;
import com.kh.totalproject.dto.response.StudyLessonResponse;
import com.kh.totalproject.service.StudyContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 언어공부 콘텐츠 조회 (로그인 없이 가능 — SecurityConfig의 /study/** permitAll).
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/study/content")
public class StudyContentController {
    private final StudyContentService studyContentService;

    // 챕터 + 강의 목록
    @GetMapping("/{language}/chapters")
    public ResponseEntity<List<StudyChapterResponse>> getChapters(@PathVariable String language) {
        return ResponseEntity.ok(studyContentService.getChapters(language));
    }

    // 강의 본문 (마크다운)
    @GetMapping("/{language}/{chapterKey}/{lessonKey}")
    public ResponseEntity<StudyLessonResponse> getLesson(@PathVariable String language,
                                                         @PathVariable String chapterKey,
                                                         @PathVariable String lessonKey) {
        return ResponseEntity.ok(studyContentService.getLesson(language, chapterKey, lessonKey));
    }
}
