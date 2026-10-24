package com.kh.totalproject.entity;

import com.kh.totalproject.constant.Status;
import com.vladmihalcea.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Builder
public class ReportBoard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Long id;

    private String title;

    @Lob
    @Column(length = 1000)
    private String content;

    private String imgUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 신고글 작성시 드롭다운 메뉴 선택 (예시 : 악성유저, 버그 등등)
    @Type(JsonType.class)
    @Column(columnDefinition = "json")
    private List<String> report;

    @Enumerated(EnumType.STRING)
    private Status status;

    // 게시글 새로운 생성시 작동
    @PrePersist
    public void defaultSetUp() {
        if (status == null) {
            this.status = Status.ACTIVE;
        }

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    public void preUpdate() {
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_key", nullable = false,  referencedColumnName = "user_key")  // FK 컬럼 지정
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id", nullable = false, referencedColumnName = "board_id")
    private Board board;

    @OneToMany(mappedBy = "reportBoard", cascade = CascadeType.REMOVE)
    @Builder.Default
    private List<ReportComment> reportComments = new ArrayList<>();

    public void addComment(ReportComment reportComment) {
        reportComments.add(reportComment);
        reportComment.setReportBoard(this);
    }

    public void removeComment(ReportComment reportComment) {
        reportComments.remove(reportComment);
        reportComment.setReportBoard(null);
    }
}
