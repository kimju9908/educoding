/* 서비스 계층에서 사용할 Enum 클래스, Entity 와는 아무 연관 없음 */
package com.kh.totalproject.constant;

import com.fasterxml.jackson.annotation.JsonFormat;

@JsonFormat(shape = JsonFormat.Shape.STRING)
public enum BoardType {
    CODING,
    COURSE,
    STUDY,
    TEAM;

    public static BoardType fromString(String boardType) {
        try {
            return BoardType.valueOf(boardType.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("잘못된 게시판 타입입니다: " + boardType);
        }
    }
}
