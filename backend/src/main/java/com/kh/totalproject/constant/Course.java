/* 커뮤니티 진로질문 게시판에 해당하는 진로 관련 태그 */
package com.kh.totalproject.constant;

import lombok.Getter;

@Getter
public enum Course {
    COMPANY("회사정보"),
    PORTFOLIO("포트폴리오"),
    SALARY("급여"),
    RESUME("자기소개서"),
    BOOTCAMP("부트캠프"),
    PROJECT("프로젝트"),
    ETC("기타");
    private final String displayName;

    Course(String displayName) {
        this.displayName = displayName;
    }

}
