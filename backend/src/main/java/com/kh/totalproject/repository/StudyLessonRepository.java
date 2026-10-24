package com.kh.totalproject.repository;

import com.kh.totalproject.entity.StudyLesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface StudyLessonRepository extends JpaRepository<StudyLesson, Long> {
    @Query("select l from StudyLesson l join fetch l.chapter c " +
            "where c.language = :language and c.chapterKey = :chapterKey and l.lessonKey = :lessonKey")
    Optional<StudyLesson> findByPath(@Param("language") String language,
                                     @Param("chapterKey") String chapterKey,
                                     @Param("lessonKey") String lessonKey);

    boolean existsByChapter_ChapterIdAndLessonKey(Long chapterId, String lessonKey);
}
