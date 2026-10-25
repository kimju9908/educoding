package com.kh.totalproject.learning;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name="learning_plan", indexes=@Index(name="idx_learning_plan_owner", columnList="user_key,profile_key,plan_id"))
@Getter @Setter @NoArgsConstructor
public class LearningPlanEntity {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="plan_id")
    private Long id;
    @Column(name="user_key", nullable=false) private Long userKey;
    @Column(name="profile_key", nullable=false, length=80) private String profileKey;
    @Column(nullable=false, length=64) private String fingerprint;
    @Column(nullable=false) private int rulesVersion;
    @Column(nullable=false) private LocalDateTime asOf;
    @Column(nullable=false) private LocalDateTime startedAt;
    private LocalDateTime generatedAt;
    @Lob @Column(columnDefinition="LONGTEXT", nullable=false) private String snapshotJson;
    @Lob @Column(columnDefinition="LONGTEXT") private String stepsJson;
    @Column(nullable=false, length=20) private String source;
}
