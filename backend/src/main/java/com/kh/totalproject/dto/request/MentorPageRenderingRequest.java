package com.kh.totalproject.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor // 해당 클래스의 모든 필드의 매개변수로 받는 생성자를 자동으로 생성해주는 역할
@NoArgsConstructor // 기본 생성자를 자동으로 생성해주는 역할

public class MentorPageRenderingRequest {
    // 페이지네이션 관련
    private int currentPage; // 현재 Page
    private int size; // Page(당) 크기

    // 렌더링 조건 관련
    private String searchKeyword; // 검색 입력 값
    private String sortType; // 정렬 입력 값
    private String tag; // 추가: 태그 필터링 조건

    // 유저 PK
    private Long userKey;
}
