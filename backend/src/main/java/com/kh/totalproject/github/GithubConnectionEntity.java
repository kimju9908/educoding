package com.kh.totalproject.github;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** One row per user. githubUserId/githubLogin is step 1 (identity, "GitHub 로그인");
 * installationId/installationAccountLogin/installationAccountType is step 2
 * ("저장소 접근 권한 연결"). Either half can be null -- see docs/github-diagnosis.md
 * section 1 for why they're tracked separately. revokedAt marks a soft local
 * disconnect; the GitHub-side installation itself is left alone (see same doc). */
@Entity
@Table(name = "github_connection", indexes = @Index(name = "idx_github_connection_owner", columnList = "user_key"))
@Getter @Setter @NoArgsConstructor
public class GithubConnectionEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "connection_id")
    private Long id;

    @Column(name = "user_key", nullable = false, unique = true)
    private Long userKey;

    @Column(name = "github_user_id")
    private Long githubUserId;

    @Column(name = "github_login", length = 100)
    private String githubLogin;

    @Column(name = "installation_id")
    private Long installationId;

    @Column(name = "installation_account_login", length = 100)
    private String installationAccountLogin;

    @Column(name = "installation_account_type", length = 20)
    private String installationAccountType;

    @Column(name = "connected_at")
    private LocalDateTime connectedAt;

    @Column(name = "installed_at")
    private LocalDateTime installedAt;

    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    // Cache only -- for showing UI state ("쓰기 권한 연결됨" / "다시 연결해주세요"). The actual upload path
    // (AutoCommitJobRunner) always re-checks live before writing and never trusts this flag alone; see
    // docs/github-auto-commit.md section 1. installPermissionUpdateUrl() is GitHub's own installation
    // settings page, not a flow this app controls.
    @Column(name = "write_permission_granted")
    private boolean writePermissionGranted;

    @Column(name = "write_permission_checked_at")
    private LocalDateTime writePermissionCheckedAt;

    public boolean isLoggedIn() { return githubUserId != null && revokedAt == null; }
    public boolean isInstalled() { return installationId != null && revokedAt == null; }

    public String installationManageUrl() {
        return "https://github.com/settings/installations/" + installationId;
    }
}
