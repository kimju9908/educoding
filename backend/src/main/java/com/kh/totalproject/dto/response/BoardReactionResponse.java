package com.kh.totalproject.dto.response;

import com.kh.totalproject.constant.Reaction;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardReactionResponse {
    private Reaction reaction;
    private int likeCnt;
    private int dislikeCnt;
}
