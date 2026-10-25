package com.kh.totalproject.learning;

import com.kh.totalproject.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import static com.kh.totalproject.learning.LearningModels.*;

@RestController @RequiredArgsConstructor
@RequestMapping("/api/learning-path")
public class LearningPlanController {
    private final LearningPlanService service;
    public record Request(String language,String level,String goal,boolean refresh) {}
    @GetMapping
    public Plan get(@RequestParam String language,@RequestParam String level,@RequestParam String goal) {
        return service.get(SecurityUtil.getCurrentUserIdOrThrow(),new Profile(language,level,goal));
    }
    @PostMapping
    public Plan generate(@RequestBody Request request) {
        return service.generate(SecurityUtil.getCurrentUserIdOrThrow(),
                new Profile(request.language(),request.level(),request.goal()),request.refresh());
    }
}
