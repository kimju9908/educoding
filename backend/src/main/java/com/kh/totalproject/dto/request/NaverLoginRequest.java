package com.kh.totalproject.dto.request;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
public class NaverLoginRequest {
    private String token;  // 네이버 로그인에서 받아온 액세스 토큰
}
