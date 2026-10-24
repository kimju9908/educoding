package com.kh.totalproject.dto.request;

import com.kh.totalproject.constant.MentorTag;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor // 해당 클래스의 모든 필드의 매개변수로 받는 생성자를 자동으로 생성해주는 역할
@NoArgsConstructor // 기본 생성자를 자동으로 생성해주는 역할

public class MentorPostRequest {

    private Long mentorId; // 수정 시 사용할 멘토 ID
    private String title; // 제목
    private String position; // 직무
    private String content; // 내용
    private String career; // 경력
    private String currentJob; // 현직
    private List<MentorTag> tag; // 카테고리
    private String hour; // 진행 시간
    private String price; // 진행 금액
    private LocalDateTime createdAt; //생성 날짜

    // 유저 PK
    private Long userKey;


    public MentorPostRequest(String title, String position, String content, String career, String currentJob, List<MentorTag> tag, String hour, String price, LocalDateTime createdAt, Long userKey) {
    }
}
