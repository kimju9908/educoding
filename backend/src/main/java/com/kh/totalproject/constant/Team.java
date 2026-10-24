/* 커뮤니티 프로젝트 게시판에 해당하는 프로젝트 관련 태그 */
package com.kh.totalproject.constant;

import lombok.Getter;

@Getter
public enum Team {
    FRONT("프론트엔드"),
    BACK("벡엔드"),
    DBA("DBA"),
    DBS("DBS"),
    DESIGNER("디자이너"),
    ETC("기타");
    private final String displayName;

    Team(String displayName) {
        this.displayName = displayName;
    }

}
