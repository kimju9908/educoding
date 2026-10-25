package com.kh.totalproject.github;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** One row per user: which installed repo/branch/base path solved problems get
 * auto-committed to, and whether that's actually turned on. Connecting an
 * account or approving write permission never sets enabled=true by itself --
 * only POST /api/github/auto-save/enable does (docs/github-auto-commit.md
 * section 1: "계정 연결만으로 자동 커밋을 켜지 않는다"). */
@Entity
@Table(name = "github_auto_save_setting", indexes = @Index(name = "idx_auto_save_setting_owner", columnList = "user_key"))
@Getter @Setter @NoArgsConstructor
public class AutoSaveSettingEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "setting_id")
    private Long id;

    @Column(name = "user_key", nullable = false, unique = true)
    private Long userKey;

    @Column(name = "connection_id", nullable = false)
    private Long connectionId;

    // GithubRepositoryEntity.id -- independent of feature ①'s diagnosis "selected" repos;
    // the UI may default to one of those for convenience, but this is its own choice.
    @Column(name = "repository_id", nullable = false)
    private Long repositoryId;

    @Column(nullable = false, length = 100)
    private String owner;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 100)
    private String branch;

    // Root folder under which the language/problem tree is written; "" = repo root.
    @Column(name = "base_path", nullable = false, length = 200)
    private String basePath = "";

    @Column(nullable = false)
    private boolean enabled;

    @Column(name = "enabled_at")
    private LocalDateTime enabledAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
