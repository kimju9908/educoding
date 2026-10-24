package com.kh.totalproject.service;

import com.kh.totalproject.dto.request.StudyChapterRequest;
import com.kh.totalproject.dto.request.StudyLessonRequest;
import com.kh.totalproject.dto.response.StudyChapterResponse;
import com.kh.totalproject.dto.response.StudyLessonResponse;
import com.kh.totalproject.entity.StudyChapter;
import com.kh.totalproject.entity.StudyLesson;
import com.kh.totalproject.exception.DuplicateResourceException;
import com.kh.totalproject.exception.InvalidValueException;
import com.kh.totalproject.repository.StudyChapterRepository;
import com.kh.totalproject.repository.StudyLessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudyContentService {
    // 프론트 라우트(/study/{language})에 있는 언어만 허용
    public static final Set<String> LANGUAGES = Set.of("java", "c", "cplus", "javascript", "python");
    // URL 경로에 그대로 들어가는 값이라 숫자만 허용 ("01", "02" ...)
    private static final Pattern KEY_PATTERN = Pattern.compile("^[0-9]{1,3}$");

    private final StudyChapterRepository chapterRepository;
    private final StudyLessonRepository lessonRepository;

    // ── 조회 (누구나) ───────────────────────────────────────────────

    public List<StudyChapterResponse> getChapters(String language) {
        return chapterRepository.findByLanguageOrderBySortOrderAsc(normalizeLanguage(language)).stream()
                .map(StudyChapterResponse::of)
                .toList();
    }

    public StudyLessonResponse getLesson(String language, String chapterKey, String lessonKey) {
        return lessonRepository.findByPath(normalizeLanguage(language), chapterKey, lessonKey)
                .map(StudyLessonResponse::of)
                .orElseThrow(() -> new NoSuchElementException("존재하지 않는 강의입니다."));
    }

    // ── 챕터 관리 (관리자) ──────────────────────────────────────────

    @Transactional
    public StudyChapterResponse createChapter(StudyChapterRequest request) {
        String language = normalizeLanguage(request.getLanguage());
        String chapterKey = requireKey(request.getChapterKey(), "챕터 번호");
        if (chapterRepository.existsByLanguageAndChapterKey(language, chapterKey)) {
            throw new DuplicateResourceException("이미 같은 번호의 챕터가 있습니다.");
        }
        StudyChapter chapter = StudyChapter.builder()
                .language(language)
                .chapterKey(chapterKey)
                .title(requireText(request.getTitle(), "챕터 제목"))
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : Integer.parseInt(chapterKey))
                .build();
        return StudyChapterResponse.of(chapterRepository.save(chapter));
    }

    @Transactional
    public StudyChapterResponse updateChapter(Long chapterId, StudyChapterRequest request) {
        StudyChapter chapter = findChapter(chapterId);
        if (request.getChapterKey() != null) {
            String chapterKey = requireKey(request.getChapterKey(), "챕터 번호");
            if (!chapterKey.equals(chapter.getChapterKey())
                    && chapterRepository.existsByLanguageAndChapterKey(chapter.getLanguage(), chapterKey)) {
                throw new DuplicateResourceException("이미 같은 번호의 챕터가 있습니다.");
            }
            chapter.setChapterKey(chapterKey);
        }
        if (request.getTitle() != null) chapter.setTitle(requireText(request.getTitle(), "챕터 제목"));
        if (request.getSortOrder() != null) chapter.setSortOrder(request.getSortOrder());
        return StudyChapterResponse.of(chapter);
    }

    @Transactional
    public void deleteChapter(Long chapterId) {
        // 강의도 함께 삭제됨 (cascade + orphanRemoval)
        chapterRepository.delete(findChapter(chapterId));
    }

    // ── 강의 관리 (관리자) ──────────────────────────────────────────

    public StudyLessonResponse getLessonById(Long lessonId) {
        return StudyLessonResponse.of(findLesson(lessonId));
    }

    @Transactional
    public StudyLessonResponse createLesson(StudyLessonRequest request) {
        if (request.getChapterId() == null) throw new InvalidValueException("소속 챕터를 선택해 주세요.");
        StudyChapter chapter = findChapter(request.getChapterId());
        String lessonKey = requireKey(request.getLessonKey(), "강의 번호");
        if (lessonRepository.existsByChapter_ChapterIdAndLessonKey(chapter.getChapterId(), lessonKey)) {
            throw new DuplicateResourceException("이 챕터에 이미 같은 번호의 강의가 있습니다.");
        }
        StudyLesson lesson = StudyLesson.builder()
                .chapter(chapter)
                .lessonKey(lessonKey)
                .label(requireText(request.getLabel(), "강의 이름"))
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : Integer.parseInt(lessonKey))
                .content(request.getContent() == null ? "" : request.getContent())
                .build();
        chapter.getLessons().add(lesson);
        return StudyLessonResponse.of(lessonRepository.save(lesson));
    }

    @Transactional
    public StudyLessonResponse updateLesson(Long lessonId, StudyLessonRequest request) {
        StudyLesson lesson = findLesson(lessonId);
        StudyChapter target = lesson.getChapter();
        if (request.getChapterId() != null && !request.getChapterId().equals(target.getChapterId())) {
            target = findChapter(request.getChapterId());
        }
        String lessonKey = request.getLessonKey() != null
                ? requireKey(request.getLessonKey(), "강의 번호")
                : lesson.getLessonKey();
        boolean moved = target != lesson.getChapter() || !lessonKey.equals(lesson.getLessonKey());
        if (moved && lessonRepository.existsByChapter_ChapterIdAndLessonKey(target.getChapterId(), lessonKey)) {
            throw new DuplicateResourceException("이 챕터에 이미 같은 번호의 강의가 있습니다.");
        }
        lesson.setChapter(target);
        lesson.setLessonKey(lessonKey);
        if (request.getLabel() != null) lesson.setLabel(requireText(request.getLabel(), "강의 이름"));
        if (request.getSortOrder() != null) lesson.setSortOrder(request.getSortOrder());
        if (request.getContent() != null) lesson.setContent(request.getContent());
        return StudyLessonResponse.of(lessonRepository.saveAndFlush(lesson));
    }

    @Transactional
    public void deleteLesson(Long lessonId) {
        StudyLesson lesson = findLesson(lessonId);
        lesson.getChapter().getLessons().remove(lesson);
        lessonRepository.delete(lesson);
    }

    // ── 내부 ────────────────────────────────────────────────────────

    private StudyChapter findChapter(Long chapterId) {
        return chapterRepository.findById(chapterId)
                .orElseThrow(() -> new NoSuchElementException("존재하지 않는 챕터입니다."));
    }

    private StudyLesson findLesson(Long lessonId) {
        return lessonRepository.findById(lessonId)
                .orElseThrow(() -> new NoSuchElementException("존재하지 않는 강의입니다."));
    }

    private String normalizeLanguage(String language) {
        String lang = language == null ? "" : language.trim().toLowerCase();
        if (!LANGUAGES.contains(lang)) throw new InvalidValueException("지원하지 않는 언어입니다: " + language);
        return lang;
    }

    private String requireKey(String key, String name) {
        String k = key == null ? "" : key.trim();
        if (!KEY_PATTERN.matcher(k).matches()) throw new InvalidValueException(name + "는 숫자로만 입력해 주세요. (예: 01)");
        return k;
    }

    private String requireText(String text, String name) {
        if (text == null || text.isBlank()) throw new InvalidValueException(name + "을(를) 입력해 주세요.");
        return text.trim();
    }
}
