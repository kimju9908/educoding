package com.kh.totalproject.dto.request;

import com.kh.totalproject.entity.Board;
import com.kh.totalproject.entity.Comment;
import com.kh.totalproject.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CommentRequest {
    private Long boardId;
    private Long commentId;
    private String name;
    private String content;

    // 댓글 작성시 필요한 빌더 패턴
    public Comment toAddComment(User user, Board board) {
        return Comment.builder()
                .content(this.content)
                .user(user)
                .board(board)
                .build();
    }

    // 댓글 수정시 필요한 빌더 패턴
    public Comment toUpdateComment(User user, Board board, Comment existingData) {
        return Comment.builder()
                .id(commentId)
                .content(this.content != null ? this.content : existingData.getContent())
                .user(user)
                .board(board)
                .createdAt(existingData.getCreatedAt())
                .build();
    }
}
