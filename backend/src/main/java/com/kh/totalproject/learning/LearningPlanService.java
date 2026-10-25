package com.kh.totalproject.learning;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kh.totalproject.constant.codechallenge.enums.CodeChallengeLanguage;
import com.kh.totalproject.constant.codechallenge.enums.CodeChallengeDifficulty;
import com.kh.totalproject.exception.CodeReviewException;
import com.kh.totalproject.repository.CodeChallengeRepository;
import com.kh.totalproject.repository.StudyLessonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.*;
import static com.kh.totalproject.learning.LearningModels.*;

@Service @RequiredArgsConstructor @Slf4j
public class LearningPlanService {
    private final LearningDataRepository data;
    private final CodeChallengeRepository challenges;
    private final StudyLessonRepository lessons;
    private final LearningCatalog catalog;
    private final LearningEngine engine;
    private final LearningPlanRepository plans;
    private final LearningPlanClient client;
    private final ObjectMapper mapper;
    private final TransactionTemplate tx;
    private static final Map<String,List<CodeChallengeLanguage>> LANGUAGES=Map.of(
            "java",List.of(CodeChallengeLanguage.JAVA17),"python",List.of(CodeChallengeLanguage.PYTHON3),
            "javascript",List.of(CodeChallengeLanguage.NODEJS20,CodeChallengeLanguage.NODEJS20ESM),
            "c",List.of(CodeChallengeLanguage.C11),"cplus",List.of(CodeChallengeLanguage.CPP17));
    private record Claim(LearningPlanEntity row, Snapshot snapshot, boolean generate) {}
    public static Profile validate(Profile p) {
        if(p==null || p.language()==null || p.goal()==null || !LANGUAGES.containsKey(p.language()) || !Set.of("BASICS","PRACTICE").contains(p.goal()))
            throw new CodeReviewException(HttpStatus.BAD_REQUEST,"언어·수준·학습 목표를 선택해주세요.");
        try { CodeChallengeDifficulty.valueOf(p.level()); }
        catch(Exception ex) { throw new CodeReviewException(HttpStatus.BAD_REQUEST,"올바른 수준을 선택해주세요."); }
        return p;
    }
    private String key(Profile p) { return p.language()+":"+p.level()+":"+p.goal(); }
    public Plan get(Long owner,Profile profile) {
        validate(profile);
        return tx.execute(status -> {
            var snapshot=snapshot(owner,profile);
            return plans.findFirstByUserKeyAndProfileKeyOrderByIdDesc(owner,key(profile))
                    .map(row->view(row,snapshot)).orElse(new Plan(null,LearningEngine.RULES_VERSION,snapshot.asOf(),null,
                            profile,"NONE",false,false,snapshot.summary(),List.of(),snapshot.notice()));
        });
    }
    public Plan generate(Long owner,Profile profile,boolean force) {
        validate(profile);
        var claim=tx.execute(status -> {
            data.lockUser(owner);
            var snapshot=snapshot(owner,profile);
            var previous=plans.findFirstByUserKeyAndProfileKeyOrderByIdDesc(owner,key(profile));
            if(previous.isPresent()) {
                var row=previous.get();
                if(row.getSource().equals("PENDING") && row.getStartedAt().isAfter(LocalDateTime.now().minusSeconds(180)))
                    return new Claim(row,snapshot,false);
                if(!force && !row.getSource().equals("PENDING") && row.getFingerprint().equals(snapshot.fingerprint()))
                    return new Claim(row,snapshot,false);
            }
            var row=new LearningPlanEntity(); row.setUserKey(owner); row.setProfileKey(key(profile));
            row.setFingerprint(snapshot.fingerprint()); row.setRulesVersion(LearningEngine.RULES_VERSION);
            row.setAsOf(snapshot.asOf()); row.setStartedAt(LocalDateTime.now()); row.setSnapshotJson(json(snapshot)); row.setSource("PENDING");
            return new Claim(plans.saveAndFlush(row),snapshot,true);
        });
        if(!claim.generate()) return tx.execute(status->view(claim.row(),claim.snapshot()));
        var selected=LearningEngine.defaultSteps(claim.snapshot().candidates());
        String source="RULES";
        if(claim.snapshot().candidates().size()>=3) {
            try {
                selected=LearningEngine.validateSelection(client.generate(claim.snapshot()),claim.snapshot().candidates());
                source="AI";
            } catch(Exception ex) {
                // Never log headers, tokens, raw model responses or personal code.
                log.warn("Learning path uses rule fallback: {}",ex.getClass().getSimpleName());
            }
        }
        var finalSteps=selected; var finalSource=source;
        return tx.execute(status -> {
            var row=plans.findById(claim.row().getId()).orElseThrow();
            row.setStepsJson(json(finalSteps)); row.setSource(finalSource); row.setGeneratedAt(LocalDateTime.now());
            plans.saveAndFlush(row);
            return view(row,snapshot(owner,profile));
        });
    }
    private Snapshot snapshot(Long owner,Profile profile) {
        var now=LocalDateTime.now(); var langs=LANGUAGES.get(profile.language());
        var outcomes=data.outcomes(owner,langs,now.minusDays(90),now);
        var solved=data.solved(owner,langs,now);
        var hints=data.hints(owner,langs,now.minusDays(90),now);
        var cs=challenges.findAll(); var ls=lessons.findAll();
        var s=engine.build(profile,now,cs,ls,outcomes,solved,hints);
        // Include outcome timestamps and hint events even when aggregate scores don't change.
        // Content hashes ensure edits to a lesson invalidate an existing plan without storing its body.
        var content=ls.stream().filter(l->l.getChapter().getLanguage().equals(profile.language()))
                .sorted(Comparator.comparing(l->l.getLessonId())).map(l->List.of(l.getLessonId(),l.getLabel(),
                        l.getChapter().getChapterKey(),l.getLessonKey(),digest(Objects.toString(l.getContent(),"")))).toList();
        String fingerprint=digest(json(List.of(LearningEngine.RULES_VERSION,catalog.manifest(),profile,outcomes,
                solved.stream().sorted().toList(),hints,s.summary(),s.candidates(),content,
                cs.stream().sorted(Comparator.comparing(c->c.getChallengeId())).map(c->List.of(c.getChallengeId(),c.getTitle(),
                        c.getDifficulty(),Objects.toString(c.getDescription(),""),Objects.toString(c.getCond(),""))).toList())));
        return new Snapshot(profile,now,fingerprint,s.summary(),s.candidates(),s.taggedChallenges(),s.totalChallenges(),s.availableLessons(),s.notice());
    }
    private Plan view(LearningPlanEntity row,Snapshot current) {
        try {
            var stored=mapper.readValue(row.getSnapshotJson(),Snapshot.class);
            var steps=row.getStepsJson()==null?List.<Candidate>of():Arrays.asList(mapper.readValue(row.getStepsJson(),Candidate[].class));
            // Deleted, unpublished or retagged content cannot remain an active link in a saved route.
            var solved=data.solved(row.getUserKey(),LANGUAGES.get(current.profile().language()),current.asOf());
            steps=steps.stream().filter(c->validContent(c,current.profile()))
                    .filter(c->c.kind().equals("LESSON") || !solved.contains(Long.valueOf(c.contentId()))).toList();
            return new Plan(row.getId(),row.getRulesVersion(),row.getAsOf(),row.getGeneratedAt(),stored.profile(),row.getSource(),
                    !row.getFingerprint().equals(current.fingerprint()),row.getSource().equals("PENDING") &&
                    row.getStartedAt().isAfter(LocalDateTime.now().minusSeconds(180)),stored.summary(),steps,stored.notice());
        } catch(Exception ex) { throw new IllegalStateException("저장된 학습 경로를 읽을 수 없습니다.",ex); }
    }
    private boolean validContent(Candidate c,Profile p) {
        if(c.kind().equals("LESSON")) return lessons.findById(Long.valueOf(c.contentId())).map(l->
                l.getChapter().getLanguage().equals(p.language()) && l.getContent()!=null && !l.getContent().isBlank()
                && l.getLabel().equals(c.title()) && catalog.concepts(l).contains(c.concept())
                && c.url().equals("/study/"+p.language()+"/"+l.getChapter().getChapterKey()+"/"+l.getLessonKey())).orElse(false);
        return challenges.findById(Long.valueOf(c.contentId())).map(x->x.getTitle().equals(c.title())
                && catalog.concepts(x).contains(c.concept()) && c.url().equals("/codingtest/"+x.getDifficulty().name().toLowerCase(Locale.ROOT)+"/"+x.getChallengeId())).orElse(false);
    }
    private String json(Object value) {
        try { return mapper.writeValueAsString(value); } catch(Exception ex) { throw new IllegalStateException(ex); }
    }
    private static String digest(String text) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(text.getBytes(StandardCharsets.UTF_8))); }
        catch(Exception ex) { throw new IllegalStateException(ex); }
    }
}
