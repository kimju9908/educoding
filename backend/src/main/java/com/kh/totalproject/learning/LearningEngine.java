package com.kh.totalproject.learning;

import com.kh.totalproject.entity.CodeChallenge;
import com.kh.totalproject.entity.StudyLesson;
import com.kh.totalproject.constant.codechallenge.enums.CodeChallengeDifficulty;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import java.util.*;
import static com.kh.totalproject.learning.LearningModels.*;

/** Deterministic v1 rules. No skill scores are inferred from AI reviews or page views. */
@Component @RequiredArgsConstructor
public class LearningEngine {
    public static final int RULES_VERSION = 1;
    private final LearningCatalog catalog;

    public Snapshot build(Profile profile, LocalDateTime now, List<CodeChallenge> challenges,
                          List<StudyLesson> lessons, List<Outcome> outcomes, Set<Long> solved, List<HintUse> hints) {
        var tags = new TreeMap<Long,List<String>>();
        var byId = new TreeMap<Long,CodeChallenge>();
        for (var c : challenges) { byId.put(c.getChallengeId(),c); if (!catalog.concepts(c).isEmpty()) tags.put(c.getChallengeId(),catalog.concepts(c)); }
        var latest = new HashMap<Long,Outcome>();
        for (var o : outcomes) latest.merge(o.challengeId(),o,(a,b)->b.at().isBefore(a.at())?a:b);
        var maxHints = new HashMap<Long,Integer>();
        for (var h : hints) maxHints.merge(h.challengeId(),h.level(),Math::max);
        var summaries = new ArrayList<ConceptSummary>();
        for (String concept : catalog.manifest().prerequisites().keySet().stream().sorted().toList()) {
            var ids = tags.keySet().stream().filter(id -> tags.get(id).contains(concept) && latest.containsKey(id)).toList();
            int unresolved=0, resolved=0, hinted=0, score=0;
            for (long id : ids) {
                if (solved.contains(id)) { resolved++; continue; }
                unresolved++;
                var o=latest.get(id);
                // One latest outcome per distinct problem: repeated failures cannot multiply the score.
                if ("WRONG_ANSWER".equals(o.failure())) {
                    score+=3;
                    if (!o.at().isBefore(now.minusDays(14))) score++;
                }
                int hint=maxHints.getOrDefault(id,0);
                if (hint>0) { hinted++; score+=Math.min(hint,3); }
                // Compile/runtime/time/memory errors alone contribute zero conceptual weakness points.
            }
            String evidence="최근 90일 서로 다른 "+concept+" 문제 "+ids.size()+"개 중 "+unresolved+"개 미해결, "+resolved+
                    "개 해결 이력 있음; 미해결 중 힌트 사용 "+hinted+"개. 복습 우선순위 "+score+"점(숙련도 아님).";
            summaries.add(new ConceptSummary(concept,ids.size(),unresolved,resolved,hinted,score,evidence));
        }
        List<StudyLesson> available=lessons.stream().filter(l -> l.getChapter().getLanguage().equals(profile.language())
                && l.getContent()!=null && !l.getContent().isBlank() && !catalog.concepts(l).isEmpty())
                .sorted(Comparator.comparing(StudyLesson::getLessonId)).toList();
        String starter=profile.goal().equals("BASICS")?"연산자":"반복문";
        var ranked=summaries.stream().sorted(Comparator.comparingInt(ConceptSummary::score).reversed()
                .thenComparing(s -> s.concept().equals(starter)?0:1).thenComparing(ConceptSummary::concept)).toList();
        int maxDifficulty=CodeChallengeDifficulty.valueOf(profile.level()).ordinal();
        // Focus only where unsolved, explicitly tagged problems exist at the chosen level.
        var focus=ranked.stream().filter(s -> challenges.stream().anyMatch(c -> tags.getOrDefault(c.getChallengeId(),List.of()).contains(s.concept())
                && !solved.contains(c.getChallengeId()) && c.getDifficulty().ordinal()<=maxDifficulty)).findFirst().orElse(null);
        var candidates=new ArrayList<Candidate>();
        if (focus!=null) {
            String concept=focus.concept();
            String reason=focus.attempted()==0 ? "기록이 부족하여 자가 선택 수준 "+levelLabel(profile.level())+"·목표 "+(profile.goal().equals("BASICS")?"기초 복습":"문제 풀이 연습")+"에 따른 시작 후보입니다."
                    : focus.evidence();
            // One direct prerequisite for a short route; this is a refresher, not a mastery claim.
            for (String pre : catalog.manifest().prerequisites().getOrDefault(concept,List.of())) {
                available.stream().filter(l -> catalog.concepts(l).contains(pre)).findFirst().ifPresent(l ->
                        candidates.add(lesson(l,pre,"선수 개념 복습: "+pre+" → "+concept+". 학습 완료 여부는 추정하지 않습니다.",0)));
            }
            available.stream().filter(l -> catalog.concepts(l).contains(concept)).limit(1)
                    .forEach(l -> candidates.add(lesson(l,concept,reason,1)));
            var problems=challenges.stream().filter(c -> tags.getOrDefault(c.getChallengeId(),List.of()).contains(concept)
                    && !solved.contains(c.getChallengeId()) && c.getDifficulty().ordinal()<=maxDifficulty)
                    .sorted(Comparator.comparing(CodeChallenge::getDifficulty).thenComparing(CodeChallenge::getChallengeId)).toList();
            // New problems first, followed by unresolved wrong-answer retry. Other errors are not diagnosed as conceptual failures.
            problems.stream().filter(c -> !latest.containsKey(c.getChallengeId())).limit(3)
                    .forEach(c -> candidates.add(problem(c,concept,reason,"PRACTICE",2)));
            problems.stream().filter(c -> latest.containsKey(c.getChallengeId())
                    && "WRONG_ANSWER".equals(latest.get(c.getChallengeId()).failure())).limit(2)
                    .forEach(c -> candidates.add(problem(c,concept,reason,"RETRY",3)));
            if (candidates.stream().noneMatch(c -> c.stage()>=2)) {
                problems.stream().filter(c -> latest.containsKey(c.getChallengeId())).limit(2).forEach(c -> candidates.add(problem(c,concept,
                        "이전 제출이 미해결입니다. 채점 오류 유형만으로 개념 부족을 단정하지 않고 재연습을 제안합니다.","PRACTICE",2)));
            }
        }
        String notice="명시적 태그 문제 "+tags.size()+"/"+challenges.size()+"개, 선택 언어의 본문 있는 태그 강의 "+available.size()+
                "개 지원. 언어가 기록되지 않은 제출 전 힌트는 분석에서 제외합니다. "+
                "선택 언어의 전체 정답 이력이 있는 문제는 제외하며 최근 90일 기록을 요약합니다. "+
                (latest.keySet().stream().filter(tags::containsKey).count()<3?"기록이 부족해 시작 경로를 제안합니다. ":"")+
                (defaultSteps(candidates).size()<3?"유효 후보가 부족하여 3단계 미만으로 제공합니다. ":"")+
                "새 제출·힌트·콘텐츠 변경 시 갱신 안내를 표시하며, 새 추천을 요청할 때 다시 생성합니다. 열람은 학습 완료로 계산하지 않습니다.";
        return new Snapshot(profile,now,"",summaries,List.copyOf(candidates),tags.size(),challenges.size(),available.size(),notice);
    }
    private String levelLabel(String level) {
        return switch(level) { case "PRACTICE" -> "연습"; case "BASIC" -> "1단계까지";
            case "INTERMEDIATE" -> "2단계까지"; default -> "3단계까지"; };
    }
    private Candidate lesson(StudyLesson l,String concept,String reason,int stage) {
        var c=l.getChapter();
        return new Candidate("L:"+l.getLessonId(),"LESSON",l.getLessonId().toString(),l.getLabel(),
                "/study/"+c.getLanguage()+"/"+c.getChapterKey()+"/"+l.getLessonKey(),concept,reason,stage);
    }
    private Candidate problem(CodeChallenge c,String concept,String reason,String kind,int stage) {
        return new Candidate("C:"+c.getChallengeId(),kind,c.getChallengeId().toString(),c.getTitle(),
                "/codingtest/"+c.getDifficulty().name().toLowerCase(Locale.ROOT)+"/"+c.getChallengeId(),concept,reason,stage);
    }
    public static List<Candidate> defaultSteps(List<Candidate> candidates) {
        // Reserve a slot for retry even when lessons and new exercises fill the route.
        var selected=new ArrayList<>(candidates.stream().filter(c->c.stage()<3).limit(4).toList());
        candidates.stream().filter(c->c.stage()==3).findFirst().ifPresent(selected::add);
        if (selected.size()<5) for(var c:candidates) if(!selected.contains(c) && selected.size()<5) selected.add(c);
        selected.sort(Comparator.comparingInt(Candidate::stage));
        return List.copyOf(selected);
    }
    public static List<Candidate> validateSelection(Selection selection,List<Candidate> candidates) {
        if(selection==null || selection.candidateIds()==null) throw new IllegalArgumentException("Missing selection");
        var ids=selection.candidateIds();
        int min=Math.min(3,candidates.size());
        if(ids.size()<min || ids.size()>5 || new HashSet<>(ids).size()!=ids.size()) throw new IllegalArgumentException("Invalid step count");
        var map=new HashMap<String,Candidate>(); candidates.forEach(c->map.put(c.id(),c));
        var result=new ArrayList<Candidate>(); int stage=-1;
        for(var id:ids) {
            var c=map.get(id);
            if(c==null || c.stage()<stage) throw new IllegalArgumentException("Unknown candidate or invalid order");
            stage=c.stage(); result.add(c);
        }
        for(int required:new int[]{0,1,2,3}) {
            if(candidates.stream().anyMatch(c->c.stage()==required) && result.stream().noneMatch(c->c.stage()==required))
                throw new IllegalArgumentException("Missing learning phase");
        }
        return List.copyOf(result);
    }
}
