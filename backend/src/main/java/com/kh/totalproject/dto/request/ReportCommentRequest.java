package com.kh.totalproject.dto.request;

import com.kh.totalproject.entity.ReportBoard;
import com.kh.totalproject.entity.ReportComment;
import com.kh.totalproject.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReportCommentRequest {
    private Long reportId;
    private Long commentId;
    private String content;

    public ReportComment toAddComment(User user, ReportBoard reportBoard) {
        return ReportComment.builder()
                .content(content)
                .user(user)
                .reportBoard(reportBoard)
                .build();
    }
}
