/* 엘라스틱 서치에 따로 저장할 Request 매핑 */
package com.kh.totalproject.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Document(indexName = "board_index")
public class ElasticBoardRequest {
    @Id
    private Long boardId;   // board 의 고유값
    private String title;
    private String content;
    private String type;
}
