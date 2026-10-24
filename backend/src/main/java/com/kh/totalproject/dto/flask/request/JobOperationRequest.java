package com.kh.totalproject.dto.flask.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobOperationRequest {
    private String jobId;
    private Long userId;
}
