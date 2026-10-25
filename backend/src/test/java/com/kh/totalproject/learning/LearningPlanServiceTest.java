package com.kh.totalproject.learning;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kh.totalproject.entity.CodeChallenge;
import com.kh.totalproject.entity.StudyChapter;
import com.kh.totalproject.entity.StudyLesson;
import com.kh.totalproject.constant.codechallenge.enums.CodeChallengeDifficulty;
import com.kh.totalproject.repository.*;
import org.junit.jupiter.api.*;
import org.springframework.core.io.ClassPathResource;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.transaction.support.TransactionCallback;
import java.time.LocalDateTime;
import java.util.*;
import static com.kh.totalproject.learning.LearningModels.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

/** Repository/RAG doubles: persistence payload, cache, refresh and owner scoping, not a live DB test. */
class LearningPlanServiceTest {
    LearningDataRepository data=mock(LearningDataRepository.class);
    CodeChallengeRepository challenges=mock(CodeChallengeRepository.class);
    StudyLessonRepository lessons=mock(StudyLessonRepository.class);
    LearningPlanRepository plans=mock(LearningPlanRepository.class);
    LearningPlanClient client=mock(LearningPlanClient.class);
    TransactionTemplate tx=mock(TransactionTemplate.class);
    LearningPlanService service;
    List<LearningPlanEntity> saved=new ArrayList<>();
    Profile profile=new Profile("java","PRACTICE","PRACTICE");
    @BeforeEach void setup() throws Exception {
        ObjectMapper mapper=new ObjectMapper().findAndRegisterModules();
        var catalog=new LearningCatalog(mapper,new ClassPathResource("learning/catalog.json"));
        service=new LearningPlanService(data,challenges,lessons,catalog,new LearningEngine(catalog),plans,client,mapper,tx);
        when(tx.execute(any())).thenAnswer(i->((TransactionCallback<?>)i.getArgument(0)).doInTransaction(null));
        var cs=new ArrayList<CodeChallenge>();
        String[] titles={"구구단","1부터 N까지 합 구하기","계단 만들기"};
        for(int i=0;i<3;i++) { var c=new CodeChallenge(); c.setChallengeId(7L+i); c.setTitle(titles[i]); c.setDifficulty(CodeChallengeDifficulty.PRACTICE); cs.add(c); }
        when(challenges.findAll()).thenReturn(cs);
        cs.forEach(c->when(challenges.findById(c.getChallengeId())).thenReturn(Optional.of(c)));
        var l=StudyLesson.builder().lessonId(1L).chapter(StudyChapter.builder().language("java").chapterKey("02").build())
                .lessonKey("05").label("05. 반복문").content("실제 본문").build();
        when(lessons.findAll()).thenReturn(List.of(l)); when(lessons.findById(1L)).thenReturn(Optional.of(l));
        when(data.outcomes(anyLong(),anyList(),any(),any())).thenReturn(List.of());
        when(data.solved(anyLong(),anyList(),any())).thenReturn(Set.of());
        when(data.hints(anyLong(),anyList(),any(),any())).thenReturn(List.of());
        when(plans.findFirstByUserKeyAndProfileKeyOrderByIdDesc(anyLong(),anyString())).thenAnswer(i->saved.stream()
                .filter(r->r.getUserKey().equals(i.getArgument(0)) && r.getProfileKey().equals(i.getArgument(1)))
                .max(Comparator.comparing(LearningPlanEntity::getId)));
        when(plans.saveAndFlush(any())).thenAnswer(i->{ LearningPlanEntity r=i.getArgument(0); if(r.getId()==null){r.setId((long)saved.size()+1);saved.add(r);}return r;});
        when(plans.findById(anyLong())).thenAnswer(i->saved.stream().filter(r->r.getId().equals(i.getArgument(0))).findFirst());
    }
    @Test void missingAiFallsBackThenCachesAndExplicitRefreshCreatesNewSnapshot() {
        when(client.generate(any())).thenThrow(new IllegalStateException("unavailable"));
        Plan first=service.generate(1L,profile,false);
        assertThat(first.source()).isEqualTo("RULES"); assertThat(first.steps()).hasSizeBetween(3,5);
        assertThat(saved.get(0).getSnapshotJson()).contains("후보").contains("summary");
        assertThat(service.get(1L,profile).steps()).isEqualTo(first.steps());
        assertThat(service.generate(1L,profile,false).id()).isEqualTo(first.id());
        verify(client,times(1)).generate(any());
        assertThat(service.generate(1L,profile,true).id()).isNotEqualTo(first.id());
        assertThat(saved).hasSize(2);
    }
    @Test void forgedAiSelectionFallsBackToServerLinksAndEvidence() {
        when(client.generate(any())).thenReturn(new Selection(List.of("C:999","L:999","bad")));
        var plan=service.generate(1L,profile,false);
        assertThat(plan.source()).isEqualTo("RULES");
        assertThat(plan.steps()).allSatisfy(c->assertThat(c.url()).startsWith("/"));
        assertThat(plan.steps()).noneMatch(c->c.id().contains("999"));
    }
    @Test void newDataMarksStaleWithoutAutomaticallyCallingAiAndRegeneratesOnRequest() {
        service.generate(1L,profile,false);
        when(data.outcomes(anyLong(),anyList(),any(),any())).thenReturn(List.of(new Outcome(7,false,"WRONG_ANSWER",LocalDateTime.now().minusMinutes(1))));
        var old=service.get(1L,profile);
        assertThat(old.stale()).isTrue(); verify(client,times(1)).generate(any());
        var updated=service.generate(1L,profile,false);
        assertThat(updated.id()).isNotEqualTo(old.id()); assertThat(updated.stale()).isFalse();
        assertThat(updated.steps()).anyMatch(c->c.kind().equals("RETRY"));
    }
    @Test void otherUserCannotRetrieveSavedPlanAndAllQueriesUseAuthenticatedOwner() {
        service.generate(1L,profile,false);
        assertThat(service.get(2L,profile).id()).isNull();
        verify(data).outcomes(eq(2L),anyList(),any(),any());
        verify(data).solved(eq(2L),anyList(),any());
        verify(data).hints(eq(2L),anyList(),any(),any());
        verify(plans).findFirstByUserKeyAndProfileKeyOrderByIdDesc(eq(2L),anyString());
    }
    @Test void activeClaimIsReturnedWithoutDuplicateGenerationAndStaleClaimCanRetry() {
        var p=service.generate(1L,profile,false); var row=saved.get(0);
        row.setSource("PENDING"); row.setStepsJson(null); row.setStartedAt(LocalDateTime.now());
        var busy=service.generate(1L,profile,true);
        assertThat(busy.generating()).isTrue(); assertThat(busy.id()).isEqualTo(p.id());
        verify(client,times(1)).generate(any());
        row.setStartedAt(LocalDateTime.now().minusMinutes(4));
        assertThat(service.generate(1L,profile,false).id()).isNotEqualTo(p.id());
    }
    @Test void deletedContentDoesNotLeaveBrokenSavedLinks() {
        service.generate(1L,profile,false);
        when(lessons.findById(1L)).thenReturn(Optional.empty());
        assertThat(service.get(1L,profile).steps()).noneMatch(c->c.kind().equals("LESSON"));
    }
    @Test void invalidProfileRejectedBeforeDataAccess() {
        assertThatThrownBy(()->service.get(1L,new Profile(null,null,null))).isInstanceOf(RuntimeException.class);
        assertThatThrownBy(()->service.get(1L,new Profile("java","MADEUP","BASICS"))).isInstanceOf(RuntimeException.class);
        verifyNoInteractions(data);
    }
}
