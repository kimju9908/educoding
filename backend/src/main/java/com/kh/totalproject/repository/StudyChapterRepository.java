package com.kh.totalproject.repository;

import com.kh.totalproject.entity.StudyChapter;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudyChapterRepository extends JpaRepository<StudyChapter, Long> {
    // 챕터 목록 + 강의 목록을 한 번에 (N+1 방지)
    @EntityGraph(attributePaths = "lessons")
    List<StudyChapter> findByLanguageOrderBySortOrderAsc(String language);

    Optional<StudyChapter> findByLanguageAndChapterKey(String language, String chapterKey);

    boolean existsByLanguageAndChapterKey(String language, String chapterKey);
}
