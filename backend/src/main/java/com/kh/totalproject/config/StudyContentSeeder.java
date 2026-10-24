package com.kh.totalproject.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kh.totalproject.entity.StudyChapter;
import com.kh.totalproject.entity.StudyLesson;
import com.kh.totalproject.repository.StudyChapterRepository;
import com.kh.totalproject.service.StudyContentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.List;

/**
 * 언어공부 강의 초기 데이터 적재.
 * 예전에 프론트에 하드코딩돼 있던 강의(.tsx)를 마크다운으로 변환한 결과가 resources/study-seed/{language}.json에 있다.
 * study_chapter 테이블이 완전히 비어 있을 때만 1회 적재하고, 이후에는 DB가 원본 — 관리자 페이지에서 수정한다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class StudyContentSeeder implements ApplicationRunner {
    private final StudyChapterRepository chapterRepository;
    private final ObjectMapper objectMapper;

    record SeedLesson(String lessonKey, String label, Integer sortOrder, String content) {}

    record SeedChapter(String chapterKey, String title, Integer sortOrder, List<SeedLesson> lessons) {}

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        if (chapterRepository.count() > 0) return;

        int lessonCount = 0;
        for (String language : StudyContentService.LANGUAGES) {
            ClassPathResource resource = new ClassPathResource("study-seed/" + language + ".json");
            if (!resource.exists()) continue;

            List<SeedChapter> chapters;
            try (InputStream in = resource.getInputStream()) {
                chapters = objectMapper.readValue(in, new TypeReference<>() {});
            }
            for (SeedChapter c : chapters) {
                StudyChapter chapter = StudyChapter.builder()
                        .language(language)
                        .chapterKey(c.chapterKey())
                        .title(c.title())
                        .sortOrder(c.sortOrder())
                        .build();
                for (SeedLesson l : c.lessons()) {
                    chapter.getLessons().add(StudyLesson.builder()
                            .chapter(chapter)
                            .lessonKey(l.lessonKey())
                            .label(l.label())
                            .sortOrder(l.sortOrder())
                            .content(l.content())
                            .build());
                    lessonCount++;
                }
                chapterRepository.save(chapter);
            }
        }
        log.info("[StudyContentSeeder] 언어공부 강의 초기 데이터 적재 완료: 강의 {}편", lessonCount);
    }
}
