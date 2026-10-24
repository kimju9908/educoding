package com.kh.totalproject.dto.response;

import com.kh.totalproject.constant.*;
import com.kh.totalproject.entity.*;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardResponse {
    private Long boardId;
    private Long userKey;
    private String name;
    private String title;
    private String content;
    private String profileUrl;
    private String imgUrl;
    private BoardType boardType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int viewCnt;
    private int commentCnt;
    private int likeCnt;
    private int dislikeCnt;
    private long postCnt;
    private Status status;
    private List<String> language;
    private List<String> course;
    private List<String> study;
    private List<String> team;

    // 댓글 목록 추가
    private List<CommentResponse> comments;

    // 내정보에서 내가 쓴 글을 확인 하기 위한 매핑
    public static BoardResponse ofPost(Board board, int commentCnt, int likeCnt, int dislikeCnt) {
        return BoardResponse.builder()
                .boardId(board.getId())
                .name(board.getUser().getNickname())
                .profileUrl(board.getUser().getProfileUrl())
                .title(board.getTitle())
                .content(board.getContent())
                .createdAt(board.getCreatedAt())
                .updatedAt(board.getUpdatedAt())
                .boardType(board.getBoardType())
                .viewCnt(board.getViewCnt())
                .likeCnt(likeCnt)
                .dislikeCnt(dislikeCnt)
                .commentCnt(commentCnt)
                .status(board instanceof CodingBoard ? ((CodingBoard) board).getStatus() :
                        (board instanceof StudyBoard ? ((StudyBoard) board).getStatus() :
                                (board instanceof TeamBoard ? ((TeamBoard) board).getStatus() : null)))
                .language(board instanceof CodingBoard ? ((CodingBoard) board).getLanguage() : null)
                .course(board instanceof CourseBoard ? ((CourseBoard) board).getCourse() : null)
                .study(board instanceof StudyBoard ? ((StudyBoard) board).getStudy() : null)
                .team(board instanceof TeamBoard ? ((TeamBoard) board).getTeam() : null)
                .build();
    }

    public static BoardResponse of(Board board, int commentCnt, int likeCnt, int dislikeCnt) {
        return BoardResponse.builder()
                .boardId(board.getId())
                .name(board.getUser().getNickname())
                .profileUrl(board.getUser().getProfileUrl())
                .title(board.getTitle())
                .content(board.getContent())
                .createdAt(board.getCreatedAt())
                .updatedAt(board.getUpdatedAt())
                .viewCnt(board.getViewCnt())
                .likeCnt(likeCnt)
                .dislikeCnt(dislikeCnt)
                .commentCnt(commentCnt)
                .status(board instanceof CodingBoard ? ((CodingBoard) board).getStatus() :
                        (board instanceof StudyBoard ? ((StudyBoard) board).getStatus() :
                                (board instanceof TeamBoard ? ((TeamBoard) board).getStatus() : null)))
                .language(board instanceof CodingBoard ? ((CodingBoard) board).getLanguage() : null)
                .course(board instanceof CourseBoard ? ((CourseBoard) board).getCourse() : null)
                .study(board instanceof StudyBoard ? ((StudyBoard) board).getStudy() : null)
                .team(board instanceof TeamBoard ? ((TeamBoard) board).getTeam() : null)
                .build();
    }

//    // 코딩질문 게시판 전체 보여주는 매핑
//    public static BoardResponse ofAllCodingBoard(CodingBoard codingBoard, int commentCnt, int likeCnt, int dislikeCnt) {
//        return BoardResponse.builder()
//                .boardId(codingBoard.getId())
//                .name(codingBoard.getUser().getNickname())
//                .profileUrl(codingBoard.getUser().getProfileUrl())
//                .title(codingBoard.getTitle())
//                .content(codingBoard.getContent())
//                .createdAt(codingBoard.getCreatedAt())
//                .updatedAt(codingBoard.getUpdatedAt())
//                .status(codingBoard.getStatus())
//                .language(codingBoard.getLanguage())
//                .viewCnt(codingBoard.getViewCnt())
//                .likeCnt(likeCnt)
//                .dislikeCnt(dislikeCnt)
//                .commentCnt(commentCnt)
//                .build();
//    }
//
//    // 진로질문 게시판 전체 보여주는 매핑
//    public static BoardResponse ofAllCourseBoard(CourseBoard courseBoard, int commentCnt, int likeCnt, int dislikeCnt) {
//        return BoardResponse.builder()
//                .boardId(courseBoard.getId())
//                .name(courseBoard.getUser().getNickname())
//                .profileUrl(courseBoard.getUser().getProfileUrl())
//                .title(courseBoard.getTitle())
//                .content(courseBoard.getContent())
//                .createdAt(courseBoard.getCreatedAt())
//                .updatedAt(courseBoard.getUpdatedAt())
//                .course(courseBoard.getCourse())
//                .viewCnt(courseBoard.getViewCnt())
//                .likeCnt(likeCnt)
//                .dislikeCnt(dislikeCnt)
//                .commentCnt(commentCnt)
//                .build();
//    }
//
//    // 스터디모집 게시판 전체 보여주는 매핑
//    public static BoardResponse ofAllStudyBoard(StudyBoard studyBoard, int commentCnt, int likeCnt, int dislikeCnt) {
//        return BoardResponse.builder()
//                .boardId(studyBoard.getId())
//                .name(studyBoard.getUser().getNickname())
//                .profileUrl(studyBoard.getUser().getProfileUrl())
//                .title(studyBoard.getTitle())
//                .content(studyBoard.getContent())
//                .createdAt(studyBoard.getCreatedAt())
//                .updatedAt(studyBoard.getUpdatedAt())
//                .status(studyBoard.getStatus())
//                .study(studyBoard.getStudy())
//                .viewCnt(studyBoard.getViewCnt())
//                .likeCnt(likeCnt)
//                .dislikeCnt(dislikeCnt)
//                .commentCnt(commentCnt)
//                .build();
//    }
//
//    // 프로젝트모집 게시판 전체 보여주는 매핑
//    public static BoardResponse ofAllTeamBoard(TeamBoard teamBoard, int commentCnt, int likeCnt, int dislikeCnt) {
//        return BoardResponse.builder()
//                .boardId(teamBoard.getId())
//                .name(teamBoard.getUser().getNickname())
//                .profileUrl(teamBoard.getUser().getProfileUrl())
//                .title(teamBoard.getTitle())
//                .content(teamBoard.getContent())
//                .createdAt(teamBoard.getCreatedAt())
//                .updatedAt(teamBoard.getUpdatedAt())
//                .status(teamBoard.getStatus())
//                .team(teamBoard.getTeam())
//                .viewCnt(teamBoard.getViewCnt())
//                .likeCnt(likeCnt)
//                .dislikeCnt(dislikeCnt)
//                .commentCnt(commentCnt)
//                .build();
//    }

    public static BoardResponse ofOneCodingPost(CodingBoard codingBoard, int postCntByUser, int commentCnt, int likeCnt, int dislikeCnt) {
        return BoardResponse.builder()
                .boardId(codingBoard.getId())
                .userKey(codingBoard.getUser().getUserKey())
                .name(codingBoard.getUser().getNickname())
                .profileUrl(codingBoard.getUser().getProfileUrl())
                .title(codingBoard.getTitle())
                .content(codingBoard.getContent())
                .boardType(codingBoard.getBoardType())
                .imgUrl(codingBoard.getImgUrl())
                .createdAt(codingBoard.getCreatedAt())
                .updatedAt(codingBoard.getUpdatedAt())
                .status(codingBoard.getStatus())
                .language(codingBoard.getLanguage())
                .viewCnt(codingBoard.getViewCnt())
                .likeCnt(likeCnt)
                .dislikeCnt(dislikeCnt)
                .postCnt(postCntByUser)
                .commentCnt(commentCnt)
                .build();
    }

    public static BoardResponse ofOneCoursePost(CourseBoard courseBoard, int postCntByUser, int commentCnt, int likeCnt, int dislikeCnt) {
        return BoardResponse.builder()
                .boardId(courseBoard.getId())
                .userKey(courseBoard.getUser().getUserKey())
                .name(courseBoard.getUser().getNickname())
                .profileUrl(courseBoard.getUser().getProfileUrl())
                .title(courseBoard.getTitle())
                .content(courseBoard.getContent())
                .boardType(courseBoard.getBoardType())
                .imgUrl(courseBoard.getImgUrl())
                .createdAt(courseBoard.getCreatedAt())
                .updatedAt(courseBoard.getUpdatedAt())
                .course(courseBoard.getCourse())
                .viewCnt(courseBoard.getViewCnt())
                .likeCnt(likeCnt)
                .dislikeCnt(dislikeCnt)
                .postCnt(postCntByUser)
                .commentCnt(commentCnt)
                .build();
    }

    public static BoardResponse ofOneStudyPost(StudyBoard studyBoard, int postCntByUser, int commentCnt, int likeCnt, int dislikeCnt) {
        return BoardResponse.builder()
                .boardId(studyBoard.getId())
                .userKey(studyBoard.getUser().getUserKey())
                .name(studyBoard.getUser().getNickname())
                .profileUrl(studyBoard.getUser().getProfileUrl())
                .title(studyBoard.getTitle())
                .content(studyBoard.getContent())
                .boardType(studyBoard.getBoardType())
                .imgUrl(studyBoard.getImgUrl())
                .createdAt(studyBoard.getCreatedAt())
                .updatedAt(studyBoard.getUpdatedAt())
                .status(studyBoard.getStatus())
                .study(studyBoard.getStudy())
                .viewCnt(studyBoard.getViewCnt())
                .likeCnt(likeCnt)
                .dislikeCnt(dislikeCnt)
                .postCnt(postCntByUser)
                .commentCnt(commentCnt)
                .build();
    }

    public static BoardResponse ofOneTeamPost(TeamBoard teamBoard, int postCntByUser, int commentCnt, int likeCnt, int dislikeCnt) {
        return BoardResponse.builder()
                .boardId(teamBoard.getId())
                .userKey(teamBoard.getUser().getUserKey())
                .name(teamBoard.getUser().getNickname())
                .profileUrl(teamBoard.getUser().getProfileUrl())
                .title(teamBoard.getTitle())
                .content(teamBoard.getContent())
                .boardType(teamBoard.getBoardType())
                .imgUrl(teamBoard.getImgUrl())
                .createdAt(teamBoard.getCreatedAt())
                .updatedAt(teamBoard.getUpdatedAt())
                .status(teamBoard.getStatus())
                .team(teamBoard.getTeam())
                .viewCnt(teamBoard.getViewCnt())
                .likeCnt(likeCnt)
                .dislikeCnt(dislikeCnt)
                .postCnt(postCntByUser)
                .commentCnt(commentCnt)
                .build();
    }

    public static BoardResponse ofTopWriterBoard(long userKey, String nickname, String profileUrl, long postCntByUser) {
        return BoardResponse.builder()
                .userKey(userKey)
                .name(nickname)
                .profileUrl(profileUrl)
                .postCnt(postCntByUser)
                .build();
    }

    public static BoardResponse ofWeeklyPopularPost(Board board, String nickname, String profileUrl, int viewCnt, int commentCnt, int likeCnt) {
        return BoardResponse.builder()
                .boardId(board.getId())
                .title(board.getTitle())
                .content(board.getContent())
                .name(nickname)
                .profileUrl(profileUrl)
                .viewCnt(viewCnt)
                .commentCnt(commentCnt)
                .likeCnt(likeCnt)
                .boardType(board.getBoardType())
                .build();
    }

    public static BoardResponse ofSimilarPost(Board similarBoard, int viewCnt, int commentCnt, int likeCnt) {
        return BoardResponse.builder()
                .boardId(similarBoard.getId())
                .title(similarBoard.getTitle())
                .content(similarBoard.getContent())
                .boardType(similarBoard.getBoardType())
                .viewCnt(viewCnt)
                .commentCnt(commentCnt)
                .likeCnt(likeCnt)
                .build();
    }
}
