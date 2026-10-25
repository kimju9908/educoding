package com.kh.totalproject.github;

import com.kh.totalproject.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import static com.kh.totalproject.github.GithubModels.AnalysisView;

@RestController @RequiredArgsConstructor
@RequestMapping("/api/github/analysis")
public class GithubAnalysisController {
    private final GithubAnalysisService service;

    @PostMapping
    public AnalysisView request() {
        return service.requestAnalysis(SecurityUtil.getCurrentUserIdOrThrow());
    }

    @GetMapping("/latest")
    public AnalysisView latest() {
        return service.latest(SecurityUtil.getCurrentUserIdOrThrow());
    }

    @GetMapping("/{id}")
    public AnalysisView get(@PathVariable Long id) {
        return service.get(SecurityUtil.getCurrentUserIdOrThrow(), id);
    }

    @PostMapping("/{id}/cancel")
    public AnalysisView cancel(@PathVariable Long id) {
        return service.cancel(SecurityUtil.getCurrentUserIdOrThrow(), id);
    }
}
