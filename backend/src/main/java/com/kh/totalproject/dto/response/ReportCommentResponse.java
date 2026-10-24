package com.kh.totalproject.dto.response;

import com.kh.totalproject.entity.Comment;
import com.kh.totalproject.entity.ReportComment;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportCommentResponse {
    private String name;
    private Long reportId;
    private Long commentId;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ReportCommentResponse ofAdminReply(ReportComment reportComment) {
        return ReportCommentResponse.builder()
                .name(reportComment.getUser().getNickname())
                .reportId(reportComment.getReportBoard().getId())
                .commentId(reportComment.getId())
                .content(reportComment.getContent())
                .createdAt(reportComment.getCreatedAt())
                .build();
    }
}
