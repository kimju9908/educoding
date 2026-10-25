package com.kh.totalproject.github;

import com.kh.totalproject.entity.CodeChallenge;
import com.kh.totalproject.entity.StudyLesson;
import com.kh.totalproject.learning.LearningCatalog;
import com.kh.totalproject.repository.CodeChallengeRepository;
import com.kh.totalproject.repository.StudyLessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.Locale;
import java.util.Set;

import static com.kh.totalproject.github.GithubModels.RecommendedTopic;

/** Resolves a recommendedTopics concept name (from GitHub diagnosis) to the SAME
 * learning catalog ([`LearningCatalog`]) learning-path.md already uses -- real
 * links only, never model-invented ones, and re-resolved at read time so a later
 * catalog change is reflected without re-running AI (see GithubAnalysisEntity's
 * javadoc and learning-path.md's "제목·링크·추천 근거는 서버 후보의 값을 사용"). A
 * concept with no tagged lesson/challenge at all comes back unsupported -- the
 * caller then shows it as "지원 부족" instead of a dead link. */
@Component @RequiredArgsConstructor
public class GithubCatalogLinker {
    private final LearningCatalog catalog;
    private final StudyLessonRepository lessons;
    private final CodeChallengeRepository challenges;

    /** The closed concept vocabulary GithubDiagnosisContext.allowedConcepts sends to
     * the agent -- same universe LearningEngine scores against (catalog.manifest's
     * prerequisites keys), not a free scan of every tag string ever used. */
    public Set<String> allowedConcepts() {
        return catalog.manifest().prerequisites().keySet();
    }

    public RecommendedTopic link(String concept, String reason) {
        var lesson = lessons.findAll().stream()
                .filter(l -> l.getContent() != null && !l.getContent().isBlank() && catalog.concepts(l).contains(concept))
                .min(Comparator.comparing(StudyLesson::getLessonId));
        var challenge = challenges.findAll().stream()
                .filter(c -> catalog.concepts(c).contains(concept))
                .min(Comparator.comparing(CodeChallenge::getChallengeId));
        boolean supported = lesson.isPresent() || challenge.isPresent();
        return new RecommendedTopic(
                concept, reason, supported,
                lesson.map(this::lessonUrl).orElse(null), lesson.map(StudyLesson::getLabel).orElse(null),
                challenge.map(this::challengeUrl).orElse(null), challenge.map(CodeChallenge::getTitle).orElse(null));
    }

    private String lessonUrl(StudyLesson l) {
        var c = l.getChapter();
        return "/study/" + c.getLanguage() + "/" + c.getChapterKey() + "/" + l.getLessonKey();
    }

    private String challengeUrl(CodeChallenge c) {
        return "/codingtest/" + c.getDifficulty().name().toLowerCase(Locale.ROOT) + "/" + c.getChallengeId();
    }
}
