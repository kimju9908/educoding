package com.kh.totalproject.learning;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kh.totalproject.constant.codechallenge.enums.CodeChallengeDifficulty;
import com.kh.totalproject.entity.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;
import java.time.LocalDateTime;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static com.kh.totalproject.learning.LearningModels.*;

class LearningEngineTest {
    LearningEngine engine;
    LearningCatalog catalog;
    final LocalDateTime now=LocalDateTime.of(2026,10,25,12,0);
    final Profile profile=new Profile("java","PRACTICE","PRACTICE");
    List<CodeChallenge> challenges;
    List<StudyLesson> lessons;
    @BeforeEach void setup() throws Exception {
        catalog=new LearningCatalog(new ObjectMapper(),new ClassPathResource("learning/catalog.json"));
        engine=new LearningEngine(catalog);
        challenges=List.of(problem(7,"구구단"),problem(8,"1부터 N까지 합 구하기"),problem(9,"계단 만들기"));
        lessons=List.of(lesson(1L,"02","04","04. 조건문"),lesson(2L,"02","05","05. 반복문"));
    }
    CodeChallenge problem(long id,String title) {
        var c=new CodeChallenge(); c.setChallengeId(id); c.setTitle(title); c.setDifficulty(CodeChallengeDifficulty.PRACTICE); return c;
    }
    StudyLesson lesson(Long id,String chapter,String key,String label) {
        return StudyLesson.builder().lessonId(id).chapter(StudyChapter.builder().language("java").chapterKey(chapter).build())
                .lessonKey(key).label(label).content("실제 강의 본문").build();
    }
    Snapshot snapshot(List<Outcome> outcomes,Set<Long> solved,List<HintUse> hints) {
        return engine.build(profile,now,challenges,lessons,outcomes,solved,hints);
    }
    ConceptSummary loops(Snapshot s) { return s.summary().stream().filter(c->c.concept().equals("반복문")).findFirst().orElseThrow(); }
    @Test void newUserGetsRealLessonsAndProblemsWithoutInventedMastery() {
        var s=snapshot(List.of(),Set.of(),List.of());
        assertThat(LearningEngine.defaultSteps(s.candidates())).hasSizeBetween(3,5);
        assertThat(loops(s).attempted()).isZero();
        assertThat(s.notice()).contains("기록이 부족");
        assertThat(s.candidates()).allSatisfy(c -> assertThat(c.url()).startsWith("/"));
    }
    @Test void repeatedFailureCountsOnceWhileDistinctProblemsCountSeparately() {
        var repeated=new ArrayList<Outcome>();
        for(int i=0;i<20;i++) repeated.add(new Outcome(7,false,"WRONG_ANSWER",now.minusMinutes(20-i)));
        var one=loops(snapshot(repeated,Set.of(),List.of()));
        assertThat(one.attempted()).isEqualTo(1); assertThat(one.score()).isEqualTo(4);
        repeated.add(new Outcome(8,false,"WRONG_ANSWER",now));
        assertThat(loops(snapshot(repeated,Set.of(),List.of())).score()).isEqualTo(8);
    }
    @Test void solvedProblemsNoLongerCountAsWeakOrBecomeRetryCandidates() {
        var s=snapshot(List.of(new Outcome(7,false,"WRONG_ANSWER",now.minusHours(2)),new Outcome(7,true,null,now)),
                Set.of(7L),List.of(new HintUse(7,3,now.minusHours(1))));
        assertThat(loops(s).score()).isZero(); assertThat(loops(s).resolved()).isEqualTo(1);
        assertThat(s.candidates()).noneMatch(c->c.id().equals("C:7"));
    }
    @Test void hintDepthAffectsUnresolvedButTechnicalFailureAloneDoesNot() {
        var technical=List.of(new Outcome(7,false,"COMPILE_ERROR",now));
        assertThat(loops(snapshot(technical,Set.of(),List.of())).score()).isZero();
        var s=snapshot(technical,Set.of(),List.of(new HintUse(7,1,now),new HintUse(7,3,now)));
        assertThat(loops(s).score()).isEqualTo(3); assertThat(loops(s).hintedUnresolved()).isEqualTo(1);
    }
    @Test void untaggedRenamedAndEmptyLessonsAreExcluded() {
        challenges=List.of(problem(999,"배열 문제처럼 보여도 미분류"),problem(7,"변경된 제목"));
        lessons.get(0).setContent(""); lessons.get(1).setContent(null);
        var s=snapshot(List.of(),Set.of(),List.of());
        assertThat(s.taggedChallenges()).isZero(); assertThat(s.availableLessons()).isZero();
        assertThat(s.candidates()).isEmpty(); assertThat(s.notice()).contains("후보가 부족");
    }
    @Test void practiceExcludesSolvedAndRetryRequiresWrongAnswer() {
        var s=snapshot(List.of(new Outcome(7,false,"WRONG_ANSWER",now)),Set.of(8L),List.of());
        assertThat(s.candidates()).anyMatch(c->c.kind().equals("RETRY") && c.contentId().equals("7"));
        assertThat(s.candidates()).noneMatch(c->c.contentId().equals("8"));
        assertThat(s.candidates()).anyMatch(c->c.kind().equals("PRACTICE") && c.contentId().equals("9"));
        assertThat(LearningEngine.validateSelection(new Selection(LearningEngine.defaultSteps(s.candidates()).stream().map(Candidate::id).toList()),s.candidates()))
                .isEqualTo(LearningEngine.defaultSteps(s.candidates()));
    }
    @Test void invalidIdsDuplicateIdsWrongOrderAndMissingRetryAreRejected() {
        var s=snapshot(List.of(new Outcome(7,false,"WRONG_ANSWER",now)),Set.of(),List.of());
        var ids=new ArrayList<>(LearningEngine.defaultSteps(s.candidates()).stream().map(Candidate::id).toList());
        var bad=new ArrayList<>(ids); bad.set(0,"C:999");
        assertThatThrownBy(()->LearningEngine.validateSelection(new Selection(bad),s.candidates())).isInstanceOf(IllegalArgumentException.class);
        Collections.reverse(ids);
        assertThatThrownBy(()->LearningEngine.validateSelection(new Selection(ids),s.candidates())).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(()->LearningEngine.validateSelection(new Selection(List.of("C:8","C:8","C:9")),s.candidates())).isInstanceOf(IllegalArgumentException.class);
        var withoutRetry=s.candidates().stream().filter(c->!c.kind().equals("RETRY")).map(Candidate::id).toList();
        assertThatThrownBy(()->LearningEngine.validateSelection(new Selection(withoutRetry),s.candidates())).isInstanceOf(IllegalArgumentException.class);
    }
    @Test void difficultyAndLanguageBoundCandidates() {
        challenges.get(0).setDifficulty(CodeChallengeDifficulty.EXPERT);
        var s=snapshot(List.of(),Set.of(),List.of());
        assertThat(s.candidates()).noneMatch(c->c.id().equals("C:7"));
        var python=engine.build(new Profile("python","PRACTICE","PRACTICE"),now,challenges,lessons,List.of(),Set.of(),List.of());
        assertThat(python.candidates()).noneMatch(c->c.kind().equals("LESSON"));
    }
}
