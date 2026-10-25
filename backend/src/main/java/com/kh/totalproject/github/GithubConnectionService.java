package com.kh.totalproject.github;

import com.kh.totalproject.exception.CodeReviewException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static com.kh.totalproject.github.GithubModels.*;

/** Step 1 ("GitHub 로그인") and step 2 ("저장소 접근 권한 연결") of
 * docs/github-diagnosis.md section 1. Both callbacks arrive as a plain browser
 * redirect from github.com -- no Authorization header -- so the signed `state`
 * (GithubStateToken), not SecurityContext, is what proves which of our users
 * this is for. */
@Service @RequiredArgsConstructor @Slf4j
public class GithubConnectionService {
    static final int MAX_SELECTED_REPOS = 3;

    private final GithubAppProperties properties;
    private final GithubAppClient client;
    private final GithubStateToken stateToken;
    private final GithubConnectionRepository connections;
    private final GithubRepositoryRepository repositories;
    private final GithubUserLock userLock;
    private final TransactionTemplate tx;

    private void requireConfigured() {
        if (!properties.configured())
            throw new CodeReviewException(HttpStatus.SERVICE_UNAVAILABLE, "GitHub 연동이 아직 설정되지 않았습니다.");
    }

    // ---- step 1: GitHub login (identity only) -------------------------------------

    public String startOAuth(Long userKey) {
        requireConfigured();
        String state = stateToken.issue(userKey, GithubStateToken.PURPOSE_OAUTH);
        return UriComponentsBuilder.fromUriString("https://github.com/login/oauth/authorize")
                .queryParam("client_id", properties.clientId())
                .queryParam("redirect_uri", properties.domainUrl() + "/api/github/oauth/callback")
                .queryParam("state", state)
                .queryParam("allow_signup", "false")
                .build().toUriString();
    }

    /** @return the frontend URL to redirect the browser to. */
    public String handleOAuthCallback(String code, String state) {
        Long userKey = stateToken.verify(state, GithubStateToken.PURPOSE_OAUTH);
        if (userKey == null) return frontendUrl("github_oauth_invalid_state");
        try {
            var identity = client.resolveIdentity(code);
            return tx.execute(status -> {
                userLock.lock(userKey);
                var connection = connections.findByUserKey(userKey).orElseGet(GithubConnectionEntity::new);
                connection.setUserKey(userKey);
                connection.setGithubUserId(identity.id());
                connection.setGithubLogin(identity.login());
                connection.setConnectedAt(LocalDateTime.now());
                connection.setRevokedAt(null);
                connections.save(connection);
                return frontendUrl("connected");
            });
        } catch (Exception e) {
            log.warn("GitHub OAuth callback failed: {}", e.getClass().getSimpleName());
            return frontendUrl("github_oauth_failed");
        }
    }

    // ---- step 2: install (repo access, read-only) ----------------------------------

    public String startInstall(Long userKey) {
        requireConfigured();
        var connection = connections.findByUserKey(userKey)
                .filter(GithubConnectionEntity::isLoggedIn)
                .orElseThrow(() -> new CodeReviewException(HttpStatus.BAD_REQUEST, "먼저 GitHub 계정을 연결해주세요."));
        String state = stateToken.issue(userKey, GithubStateToken.PURPOSE_INSTALL);
        return UriComponentsBuilder.fromUriString("https://github.com/apps/" + properties.appSlug() + "/installations/new")
                .queryParam("state", state).build().toUriString();
    }

    /** @return the frontend URL to redirect the browser to. */
    public String handleInstallCallback(Long installationId, String setupAction, String code, String state) {
        Long userKey = stateToken.verify(state, GithubStateToken.PURPOSE_INSTALL);
        if (userKey == null) return frontendUrl("github_install_invalid_state");
        if ("request".equals(setupAction) || installationId == null) return frontendUrl("github_install_pending");
        if (code == null || code.isBlank()) {
            log.warn("GitHub install callback missing code -- check the App's "
                    + "'Request user authorization (OAuth) during installation' setting");
            return frontendUrl("github_install_unverifiable");
        }
        try {
            var connection = connections.findByUserKey(userKey)
                    .filter(GithubConnectionEntity::isLoggedIn)
                    .orElse(null);
            if (connection == null) return frontendUrl("github_install_not_logged_in");

            // The installer's identity, re-derived from THIS callback's own code --
            // never trusted from the client, never assumed from installation_id alone.
            // Exchanged exactly once (a `code` is single-use) and reused for both checks below.
            String userToken = client.exchangeCodeForUserToken(code);
            var identity = client.getUser(userToken);
            if (identity.id() != connection.getGithubUserId())
                return frontendUrl("github_install_account_mismatch");
            List<Long> ownInstallations = client.listUserInstallationIds(userToken);
            if (!ownInstallations.contains(installationId))
                return frontendUrl("github_install_not_owned");

            var info = client.getInstallation(installationId);
            String installationToken = client.createInstallationToken(installationId);
            var repos = client.listInstallationRepositories(installationToken);

            tx.executeWithoutResult(status -> {
                userLock.lock(userKey);
                var previouslySelected = repositories.findByConnectionIdAndSelectedTrue(connection.getId()).stream()
                        .map(GithubRepositoryEntity::getGithubRepoId).collect(Collectors.toSet());
                repositories.deleteByConnectionId(connection.getId());
                int kept = 0;
                for (var r : repos) {
                    var entity = new GithubRepositoryEntity();
                    entity.setConnectionId(connection.getId());
                    entity.setGithubRepoId(r.repoId());
                    entity.setOwner(r.owner());
                    entity.setName(r.name());
                    entity.setDefaultBranch(r.defaultBranch());
                    boolean keepSelected = previouslySelected.contains(r.repoId()) && kept < MAX_SELECTED_REPOS;
                    entity.setSelected(keepSelected);
                    if (keepSelected) { entity.setSelectedAt(LocalDateTime.now()); kept++; }
                    repositories.save(entity);
                }
                connection.setInstallationId(installationId);
                connection.setInstallationAccountLogin(info.accountLogin());
                connection.setInstallationAccountType(info.accountType());
                connection.setInstalledAt(LocalDateTime.now());
                connection.setWritePermissionGranted(info.hasContentsWrite());
                connection.setWritePermissionCheckedAt(LocalDateTime.now());
                connections.save(connection);
            });
            return frontendUrl("installed");
        } catch (Exception e) {
            log.warn("GitHub install callback failed: {}", e.getClass().getSimpleName());
            return frontendUrl("github_install_failed");
        }
    }

    /** Re-syncs the repository list from GitHub (e.g. the user granted access to
     * more repos from GitHub's own installation settings after connecting here). */
    public ConnectionView refreshRepositories(Long userKey) {
        var connection = requireInstalled(userKey);
        String installationToken = client.createInstallationToken(connection.getInstallationId());
        var repos = client.listInstallationRepositories(installationToken);
        tx.executeWithoutResult(status -> {
            userLock.lock(userKey);
            var previouslySelected = repositories.findByConnectionIdAndSelectedTrue(connection.getId()).stream()
                    .map(GithubRepositoryEntity::getGithubRepoId).collect(Collectors.toSet());
            repositories.deleteByConnectionId(connection.getId());
            int kept = 0;
            for (var r : repos) {
                var entity = new GithubRepositoryEntity();
                entity.setConnectionId(connection.getId());
                entity.setGithubRepoId(r.repoId());
                entity.setOwner(r.owner());
                entity.setName(r.name());
                entity.setDefaultBranch(r.defaultBranch());
                boolean keepSelected = previouslySelected.contains(r.repoId()) && kept < MAX_SELECTED_REPOS;
                entity.setSelected(keepSelected);
                if (keepSelected) { entity.setSelectedAt(LocalDateTime.now()); kept++; }
                repositories.save(entity);
            }
        });
        return connectionView(userKey);
    }

    public ConnectionView selectRepositories(Long userKey, List<Long> repoIds) {
        if (repoIds == null || repoIds.size() > MAX_SELECTED_REPOS || repoIds.stream().distinct().count() != repoIds.size())
            throw new CodeReviewException(HttpStatus.BAD_REQUEST, "저장소는 최대 " + MAX_SELECTED_REPOS + "개까지 중복 없이 선택할 수 있습니다.");
        var connection = requireInstalled(userKey);
        return tx.execute(status -> {
            userLock.lock(userKey);
            var all = repositories.findByConnectionId(connection.getId());
            Set<Long> allowedIds = all.stream().map(GithubRepositoryEntity::getId).collect(Collectors.toSet());
            if (!allowedIds.containsAll(repoIds))
                throw new CodeReviewException(HttpStatus.BAD_REQUEST, "설치된 저장소 목록 밖의 항목은 선택할 수 없습니다.");
            for (var repo : all) {
                boolean select = repoIds.contains(repo.getId());
                repo.setSelected(select);
                repo.setSelectedAt(select ? LocalDateTime.now() : null);
                repositories.save(repo);
            }
            return connectionView(userKey);
        });
    }

    public void disconnect(Long userKey) {
        tx.executeWithoutResult(status -> {
            userLock.lock(userKey);
            connections.findByUserKey(userKey).ifPresent(connection -> {
                connection.setRevokedAt(LocalDateTime.now());
                connections.save(connection);
            });
        });
    }

    public ConnectionView connectionView(Long userKey) {
        var connectionOpt = connections.findByUserKey(userKey);
        if (connectionOpt.isEmpty() || connectionOpt.get().getRevokedAt() != null)
            return new ConnectionView(false, null, false, null, List.of(), manageUrl(), false, null);
        var connection = connectionOpt.get();
        List<RepoView> repos = connection.isInstalled()
                ? repositories.findByConnectionId(connection.getId()).stream()
                        .map(r -> new RepoView(r.getId(), r.getGithubRepoId(), r.getOwner(), r.getName(), r.getDefaultBranch(), r.isSelected()))
                        .toList()
                : List.of();
        return new ConnectionView(connection.isLoggedIn(), connection.getGithubLogin(), connection.isInstalled(),
                connection.getInstallationAccountLogin(), repos, manageUrl(),
                connection.isWritePermissionGranted(), connection.isInstalled() ? connection.installationManageUrl() : null);
    }

    /** Re-checks this installation's ACTUAL permissions against GitHub right now and
     * updates the cached flag (docs/github-auto-commit.md section 1). Call after the
     * user says they approved the permission upgrade on GitHub's own settings page --
     * there is no webhook/notification telling us it happened. */
    public ConnectionView refreshWritePermission(Long userKey) {
        var connection = requireInstalled(userKey);
        var info = client.getInstallation(connection.getInstallationId());
        tx.executeWithoutResult(status -> {
            userLock.lock(userKey);
            connection.setWritePermissionGranted(info.hasContentsWrite());
            connection.setWritePermissionCheckedAt(LocalDateTime.now());
            connections.save(connection);
        });
        return connectionView(userKey);
    }

    /** Exposed for GithubAnalysisService: the connection + its currently selected
     * repos, or throws if there is nothing analyzable yet. */
    GithubConnectionEntity requireInstalled(Long userKey) {
        return connections.findByUserKey(userKey)
                .filter(GithubConnectionEntity::isInstalled)
                .orElseThrow(() -> new CodeReviewException(HttpStatus.BAD_REQUEST, "먼저 GitHub 저장소 접근 권한을 연결해주세요."));
    }

    List<GithubRepositoryEntity> selectedRepositories(Long connectionId) {
        return repositories.findByConnectionIdAndSelectedTrue(connectionId);
    }

    private String manageUrl() { return "https://github.com/settings/installations"; }

    public String frontendStatusUrl(String status) { return frontendUrl(status); }

    private String frontendUrl(String status) {
        return UriComponentsBuilder.fromUriString(properties.domainUrl() + "/mypage/github")
                .queryParam("githubStatus", status).build().toUriString();
    }
}
