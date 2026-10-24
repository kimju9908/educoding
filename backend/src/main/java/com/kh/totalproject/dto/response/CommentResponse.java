package com.kh.totalproject.dto.response;

import com.kh.totalproject.entity.Comment;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponse {
    private String name;
    private String userId;
    private Long userKey;
    private Long boardId;
    private Long commentId;
    private String content;
    private String profileUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CommentResponse ofAllComment(Comment comment) {
        return CommentResponse.builder()
                .userKey(comment.getUser().getUserKey())
                .userId(comment.getUser().getUserId())
                .name(comment.getUser().getNickname())
                .profileUrl(comment.getUser().getProfileUrl())
                .boardId(comment.getBoard().getId())
                .commentId(comment.getId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}
