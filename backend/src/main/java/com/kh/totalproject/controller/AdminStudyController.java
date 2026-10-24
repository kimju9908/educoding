package com.kh.totalproject.controller;

import com.kh.totalproject.dto.request.StudyChapterRequest;
import com.kh.totalproject.dto.request.StudyLessonRequest;
import com.kh.totalproject.dto.response.StudyChapterResponse;
import com.kh.totalproject.dto.response.StudyLessonResponse;
import com.kh.totalproject.service.StudyContentService;
import com.kh.totalproject.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 관리자 페이지의 "강의 관리" — 챕터/강의 추가·수정·삭제. 모든 요청에서 관리자 권한을 확인한다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/study")
public class AdminStudyController {
    private final StudyContentService studyContentService;

    @PostMapping("/chapters")
    public ResponseEntity<StudyChapterResponse> createChapter(@RequestBody StudyChapterRequest request) {
        SecurityUtil.isAdminOrThrow();
        return ResponseEntity.status(HttpStatus.CREATED).body(studyContentService.createChapter(request));
    }

    @PutMapping("/chapters/{chapterId}")
    public ResponseEntity<StudyChapterResponse> updateChapter(@PathVariable Long chapterId,
                                                              @RequestBody StudyChapterRequest request) {
        SecurityUtil.isAdminOrThrow();
        return ResponseEntity.ok(studyContentService.updateChapter(chapterId, request));
    }

    @DeleteMapping("/chapters/{chapterId}")
    public ResponseEntity<Void> deleteChapter(@PathVariable Long chapterId) {
        SecurityUtil.isAdminOrThrow();
        studyContentService.deleteChapter(chapterId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/lessons/{lessonId}")
    public ResponseEntity<StudyLessonResponse> getLesson(@PathVariable Long lessonId) {
        SecurityUtil.isAdminOrThrow();
        return ResponseEntity.ok(studyContentService.getLessonById(lessonId));
    }

    @PostMapping("/lessons")
    public ResponseEntity<StudyLessonResponse> createLesson(@RequestBody StudyLessonRequest request) {
        SecurityUtil.isAdminOrThrow();
        return ResponseEntity.status(HttpStatus.CREATED).body(studyContentService.createLesson(request));
    }

    @PutMapping("/lessons/{lessonId}")
    public ResponseEntity<StudyLessonResponse> updateLesson(@PathVariable Long lessonId,
                                                            @RequestBody StudyLessonRequest request) {
        SecurityUtil.isAdminOrThrow();
        return ResponseEntity.ok(studyContentService.updateLesson(lessonId, request));
    }

    @DeleteMapping("/lessons/{lessonId}")
    public ResponseEntity<Void> deleteLesson(@PathVariable Long lessonId) {
        SecurityUtil.isAdminOrThrow();
        studyContentService.deleteLesson(lessonId);
        return ResponseEntity.noContent().build();
    }
}
