package com.kh.totalproject.dto.request;

import com.kh.totalproject.constant.Status;
import com.kh.totalproject.entity.Board;
import com.kh.totalproject.entity.ReportBoard;
import com.kh.totalproject.entity.User;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportRequest {
    private Long boardId;
    private Long reportId;
    private String title;
    private String name;
    private String content;
    private String imgUrl;
    private Status status;
    private List<String> report;

    public ReportBoard toCreateReportPost(User user, Board board) {
        return ReportBoard.builder()
                .user(user)
                .board(board)
                .title(title)
                .content(content)
                .imgUrl(imgUrl)
                .report(report)
                .build();
    }

    public ReportBoard toModifyReportPost(ReportBoard existingData) {
        return ReportBoard.builder()
                .user(existingData.getUser())
                .board(existingData.getBoard())
                .title(title != null ? title : existingData.getTitle())
                .content(content != null ? content : existingData.getContent())
                .imgUrl(imgUrl != null ? imgUrl : existingData.getImgUrl())
                .report(report != null ? report : existingData.getReport())
                .status(status != null ? status : existingData.getStatus())
                .createdAt(existingData.getCreatedAt())
                .build();
    }
}
