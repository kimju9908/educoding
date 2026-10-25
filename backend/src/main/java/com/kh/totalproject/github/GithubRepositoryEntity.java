package com.kh.totalproject.github;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** One row per repository visible through the installation. `selected` is the
 * user's own narrower choice of up to 3 repos to actually analyze -- the
 * installation may grant access to more repos than are selected here. */
@Entity
@Table(name = "github_repository", indexes = @Index(name = "idx_github_repository_connection", columnList = "connection_id"))
@Getter @Setter @NoArgsConstructor
public class GithubRepositoryEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "repository_id")
    private Long id;

    @Column(name = "connection_id", nullable = false)
    private Long connectionId;

    @Column(name = "github_repo_id", nullable = false)
    private Long githubRepoId;

    @Column(nullable = false, length = 100)
    private String owner;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "default_branch", length = 100)
    private String defaultBranch;

    @Column(nullable = false)
    private boolean selected;

    @Column(name = "selected_at")
    private LocalDateTime selectedAt;
}
