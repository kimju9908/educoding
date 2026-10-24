package com.kh.totalproject.constant;

import lombok.Getter;

@Getter

public enum MentorTag {
    PROGRAMMING("프로그래밍"),
    GAME("게임"),
    AI("인공지능"),
    SECURITY("보안"),
    DATA("데이터"),
    HARDWARE("하드웨어"),
    DESIGN("디자인"),
    STRATEGIC_MANAGEMENT("기획경영"),
    MARKETING("마케팅"),
    SELF_DEVELOPMENT("자기계발"),
    NETWORK("네트워크"),
    ETC("기타");
    private final String displayName;

    MentorTag(String displayName) {
        this.displayName = displayName;
    }
}

