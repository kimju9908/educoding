package com.kh.totalproject.github;

import com.kh.totalproject.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

import static com.kh.totalproject.github.GithubModels.*;

/** `/oauth/callback` and `/install/callback` are the only two paths here that are
 * `permitAll` in SecurityConfig -- GitHub reaches them via a plain browser
 * redirect with no Authorization header, so they're protected by the signed
 * `state` param instead (see GithubStateToken / docs/github-diagnosis.md section 1).
 * Every other endpoint here requires the normal JWT auth like any other /api route. */
@RestController @RequiredArgsConstructor
@RequestMapping("/api/github")
public class GithubConnectionController {
    private final GithubConnectionService service;

    @GetMapping("/connection")
    public ConnectionView connection() {
        return service.connectionView(SecurityUtil.getCurrentUserIdOrThrow());
    }

    @DeleteMapping("/connection")
    public ResponseEntity<Void> disconnect() {
        service.disconnect(SecurityUtil.getCurrentUserIdOrThrow());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/oauth/start")
    public Map<String, String> oauthStart() {
        return Map.of("url", service.startOAuth(SecurityUtil.getCurrentUserIdOrThrow()));
    }

    @GetMapping("/oauth/callback")
    public ResponseEntity<Void> oauthCallback(@RequestParam(required = false) String code,
                                              @RequestParam(required = false) String state,
                                              @RequestParam(required = false) String error) {
        if (error != null) return redirectTo(service.frontendStatusUrl("github_oauth_denied"));
        return redirectTo(service.handleOAuthCallback(code, state));
    }

    @GetMapping("/install/start")
    public Map<String, String> installStart() {
        return Map.of("url", service.startInstall(SecurityUtil.getCurrentUserIdOrThrow()));
    }

    @GetMapping("/install/callback")
    public ResponseEntity<Void> installCallback(@RequestParam(name = "installation_id", required = false) Long installationId,
                                                @RequestParam(name = "setup_action", required = false) String setupAction,
                                                @RequestParam(required = false) String code,
                                                @RequestParam(required = false) String state) {
        return redirectTo(service.handleInstallCallback(installationId, setupAction, code, state));
    }

    public record SelectRepositoriesRequest(List<Long> repoIds) {}

    @PostMapping("/repositories/select")
    public ConnectionView select(@RequestBody SelectRepositoriesRequest request) {
        return service.selectRepositories(SecurityUtil.getCurrentUserIdOrThrow(), request.repoIds());
    }

    @PostMapping("/repositories/refresh")
    public ConnectionView refresh() {
        return service.refreshRepositories(SecurityUtil.getCurrentUserIdOrThrow());
    }

    // writePermissionUpgradeUrl in /connection's response IS the "start" step (GitHub's own
    // installation settings page, not a flow we control) -- this just re-checks after the
    // user says they approved it there (docs/github-auto-commit.md section 1).
    @PostMapping("/write-permission/refresh")
    public ConnectionView refreshWritePermission() {
        return service.refreshWritePermission(SecurityUtil.getCurrentUserIdOrThrow());
    }

    private ResponseEntity<Void> redirectTo(String url) {
        return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(url)).build();
    }
}
