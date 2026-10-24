package com.kh.totalproject.dto.response;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class CancelJobResponse {
    // if status is 200 then true
    // else false
    private Boolean success;

    // if status is not 200 then String
    // else null
    private String error;
}
