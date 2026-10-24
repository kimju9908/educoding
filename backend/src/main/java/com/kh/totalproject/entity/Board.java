package com.kh.totalproject.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.kh.totalproject.constant.*;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ToString(exclude = {"user", "comments"})
@NoArgsConstructor
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@JsonIgnoreProperties(ignoreUnknown = true)
public class Board {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "board_id")
    @JsonProperty("boardId")
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    private int viewCnt = 0;
    private int commentCnt = 0;
    private Integer likeCnt = 0;
    private Integer dislikeCnt = 0;


    private String imgUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    private BoardType boardType;

    @Enumerated(EnumType.STRING)
    private Status status;

    // 매개변수가 포함된 생성자는 @NoArgs 어노테이션으로 처리가 불가능 하므로 매개변수가 있는 생성자 명시
    public Board(Long boardId, String title, String content, String imgUrl, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = boardId;
        this.title = title;
        this.content = content;
        this.imgUrl = imgUrl;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // 게시글 새로운 생성시 작동
    @PrePersist
    public void defaultValue() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            this.status = Status.ACTIVE; // 기본값 설정
        }
    }

    // 게시글 업데이트시 작동
    @PreUpdate
    public void updatedTime() {
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_key", nullable = false,  referencedColumnName = "user_key")  // FK 컬럼 지정
    private User user;

    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReportBoard> reportBoards = new ArrayList<>();

    @OneToMany(mappedBy = "board", cascade = CascadeType.REMOVE)
    private List<Comment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BoardReaction> boardReactions = new ArrayList<>();

    public void addComment(Comment comment) {
        comments.add(comment);
        comment.setBoard(this);
    }

    public void removeComment(Comment comment) {
        comments.remove(comment);
        comment.setBoard(null);
    }

    private void updateCommentCnt() {
        this.commentCnt = comments.size();
    }

    // 좋아요/싫어요 수 계산 (boardReactions 기준으로만 계산)
    public int getLikeCnt() {
        return (int) boardReactions.stream()
                .filter(reaction -> reaction.getReaction() == Reaction.LIKE)
                .count();
    }

    public int getDislikeCnt() {
        return (int) boardReactions.stream()
                .filter(reaction -> reaction.getReaction() == Reaction.DISLIKE)
                .count();
    }

    // 좋아요/싫어요 수 업데이트
    public void updateLikeDislikeCounts() {
        int likeCount = (int) boardReactions.stream()
                .filter(reaction -> reaction.getReaction() == Reaction.LIKE)
                .count();
        int dislikeCount = (int) boardReactions.stream()
                .filter(reaction -> reaction.getReaction() == Reaction.DISLIKE)
                .count();

        // DB에서 관리하는 카운트 값으로 업데이트
        this.likeCnt = likeCount;
        this.dislikeCnt = dislikeCount;
    }



    // 사용자의 반응을 처리 (사용자가 좋아요, 싫어요를 했는지 확인)
    public Reaction getUserReaction(User user) {
        return boardReactions.stream()
                .filter(br -> br.getUser().equals(user))
                .findFirst()
                .map(BoardReaction::getReaction)
                .orElse(Reaction.NONE);
    }
}
