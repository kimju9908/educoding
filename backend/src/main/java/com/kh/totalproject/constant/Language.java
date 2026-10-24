/* 커뮤니티 코딩질문 게시판에 해당하는 프로그래밍 언어 태그 */
package com.kh.totalproject.constant;

import lombok.Getter;

@Getter
public enum Language {
    JAVA("Java"),
    JS("Java Script"),
    PYTHON("Python"),
    C("C"),
    CPP("C++"),
    CS("C#"),
    SPB("Spring Boot"),
    RE("React"),
    AN("AngularJS"),
    EX("ExpressJS"),
    NO("NodeJS"),
    HTML("HTML"),
    CSS("CSS"),
    ETC("기타");
    private final String displayName;

    Language(String displayName) {
        this.displayName = displayName;
    }

}

