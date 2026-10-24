/* 커뮤니티 스터디 게시판에 해당하는 스터디 관련 태그 */
package com.kh.totalproject.constant;

import lombok.Getter;

@Getter
public enum Study {
    ALGORITHM("알고리즘"),
    STRUCTURE("자료구조"),
    CODING("코딩테스트"),
    ETC("기타");
    private final String displayName;

    Study(String displayName) {
        this.displayName = displayName;
    }

}
