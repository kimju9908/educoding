package com.kh.totalproject.github;

import com.kh.totalproject.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.kh.totalproject.github.GithubModels.*;

@RestController @RequiredArgsConstructor
@RequestMapping("/api/github/auto-save")
public class AutoSaveSettingController {
    private final AutoSaveSettingService service;

    @GetMapping("/settings")
    public AutoSaveSettingView settings() {
        return service.view(SecurityUtil.getCurrentUserIdOrThrow());
    }

    @PutMapping("/settings")
    public AutoSaveSettingView saveSettings(@RequestBody AutoSaveSettingRequest request) {
        return service.save(SecurityUtil.getCurrentUserIdOrThrow(), request);
    }

    @PostMapping("/enable")
    public AutoSaveSettingView enable() {
        return service.enable(SecurityUtil.getCurrentUserIdOrThrow());
    }

    @PostMapping("/disable")
    public AutoSaveSettingView disable() {
        return service.disable(SecurityUtil.getCurrentUserIdOrThrow());
    }

    @GetMapping("/preview")
    public AutoCommitPreview preview() {
        return service.preview(SecurityUtil.getCurrentUserIdOrThrow());
    }

    @GetMapping("/jobs")
    public List<AutoCommitJobView> jobs() {
        return service.recentJobs(SecurityUtil.getCurrentUserIdOrThrow());
    }

    @PostMapping("/jobs/{id}/retry")
    public AutoCommitJobView retry(@PathVariable Long id) {
        return service.retry(SecurityUtil.getCurrentUserIdOrThrow(), id);
    }
}
