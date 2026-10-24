package com.kh.totalproject.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kh.totalproject.constant.MentorTag;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class MentorResponse {

    // Mentor TB
    @JsonProperty("mentorId") // 필드이름 매핑 -> Java 코드와 JSON 데이터의 필드 이름을 다르게 하고 싶을 때 사용
    private Long id; // mentor TB PK
    private String title; // 제목
    private String position; // 직무
    private String content; // 내용
    private String career; // 경력
    private String currentJob; // 현직
    private Double rating; // 평점
    private Integer menteeCount; // 수락한 멘티 수
    private LocalDateTime createdAt; // 생성 날짜
    private String hour; // 진행 시간
    private String price; // 진행 금액
    private List<MentorTag> tag; // 태그


    // User TB
    private String userNickname; // 닉네임
    private String profileUrl; // 프로필사진
    private Long mentorUserKey; // 작성자의 userKey 추가

    // 전체 멘토 content box(에) 사용되는 Data
    public static MentorResponse ofPagination(Long id, String title, String position, String career,String currentJob,
                                              Double rating, Integer menteeCount, LocalDateTime createdAt, String nickname, String profileUrl) {
        return MentorResponse.builder()
                .id(id)
                .title(title)
                .position(position)
                .career(career)
                .currentJob(currentJob)
                .rating(rating)
                .menteeCount(menteeCount)
                .createdAt(createdAt)
                .userNickname(nickname)
                .profileUrl(profileUrl)
                .build();
    }

    // 선택한 멘토 상세보기 (모달창)
    public static MentorResponse ofModalDetail(Long id, String title, String position, String career,String currentJob, Integer menteeCount,
                                               String nickname, String profileUrl, String content, String hour, String price, List<MentorTag> tag, Long mentorUserKey) {
        return MentorResponse.builder()
                .id(id)
                .title(title)
                .position(position)
                .career(career)
                .currentJob(currentJob)
                .menteeCount(menteeCount)
                .userNickname(nickname)
                .profileUrl(profileUrl)
                .content(content)
                .hour(hour)
                .price(price)
                .tag(tag)
                .mentorUserKey(mentorUserKey)
                .build();
    }

    // 멘토글 작성 미리보기 (모달창)
    public static MentorResponse ofPreview(String nickname, String profileUrl) {

        return MentorResponse.builder()
                .userNickname(nickname)
                .profileUrl(profileUrl)
                .build();
    }
}
