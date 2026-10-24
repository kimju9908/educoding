package com.kh.totalproject.dto.response;

import com.kh.totalproject.constant.Status;
import com.kh.totalproject.entity.ReportBoard;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportResponse {
    private Long reportId;
    private Long boardId;
    private String title;
    private String name;
    private String content;
    private String imgUrl;
    private Status status;
    private LocalDateTime createdAt;
    private List<String> report;
    private List<ReportCommentResponse> reportCommentResponses;

    public static ReportResponse ofReportPostList(ReportBoard reportBoard) {
        return ReportResponse.builder()
                .reportId(reportBoard.getId())
                .name(reportBoard.getUser().getNickname())
                .title(reportBoard.getTitle())
                .content(reportBoard.getContent())
                .createdAt(reportBoard.getCreatedAt())
                .status(reportBoard.getStatus())
                .report(reportBoard.getReport())
                .build();
    }

    public static ReportResponse ofOneReportPost(ReportBoard reportBoard) {
        return ReportResponse.builder()
                .reportId(reportBoard.getId())
                .boardId(reportBoard.getBoard().getId())
                .name(reportBoard.getUser().getNickname())
                .title(reportBoard.getTitle())
                .content(reportBoard.getContent())
                .createdAt(reportBoard.getCreatedAt())
                .status(reportBoard.getStatus())
                .report(reportBoard.getReport())
                .build();
    }
}
