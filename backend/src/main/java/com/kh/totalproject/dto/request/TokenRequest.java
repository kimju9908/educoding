/* Access Token 만료시 사용할 데이터 전송 Dto */
package com.kh.totalproject.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenRequest {
    private String refreshToken;
}
