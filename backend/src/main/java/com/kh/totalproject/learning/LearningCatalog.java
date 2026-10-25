package com.kh.totalproject.learning;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kh.totalproject.entity.CodeChallenge;
import com.kh.totalproject.entity.StudyLesson;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import java.io.IOException;
import java.util.*;

/** Explicit, reviewed mappings. Unknown or renamed content is never auto-classified. */
@Component
public class LearningCatalog {
    public record ChallengeTag(long id, String title, List<String> concepts) {}
    public record LessonTag(String language, String chapter, String lesson, String label, List<String> concepts) {}
    public record Manifest(int version, Map<String,List<String>> prerequisites,
                           List<ChallengeTag> challenges, List<LessonTag> lessons) {}
    private final Manifest manifest;
    public LearningCatalog(ObjectMapper mapper,
            @Value("${learning.catalog:classpath:learning/catalog.json}") Resource resource) throws IOException {
        try (var input = resource.getInputStream()) { manifest = mapper.readValue(input, Manifest.class); }
        for (var entry : manifest.prerequisites().entrySet()) {
            if (entry.getValue().contains(entry.getKey())) throw new IllegalArgumentException("Self prerequisite");
        }
    }
    public Manifest manifest() { return manifest; }
    public List<String> concepts(CodeChallenge c) {
        return manifest.challenges().stream().filter(t -> t.id() == c.getChallengeId() && t.title().equals(c.getTitle()))
                .findFirst().map(ChallengeTag::concepts).orElse(List.of());
    }
    public List<String> concepts(StudyLesson l) {
        var c = l.getChapter();
        return manifest.lessons().stream().filter(t -> t.language().equals(c.getLanguage())
                && t.chapter().equals(c.getChapterKey()) && t.lesson().equals(l.getLessonKey())
                && t.label().equals(l.getLabel())).findFirst().map(LessonTag::concepts).orElse(List.of());
    }
}
