package com.kh.totalproject.entity;

import com.kh.totalproject.constant.BoardType;
import com.kh.totalproject.constant.Status;
import com.vladmihalcea.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Type;


import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "coding_board")
@Getter
@Setter
@NoArgsConstructor
public class CodingBoard extends Board {

    @Type(JsonType.class)
    @Column(columnDefinition = "json")
    private List<String> language;

    @PrePersist
    private void defaultValues() {
        if (language == null) {
            this.language = new ArrayList<>();
        }

    }

    @Builder
    public CodingBoard(User user, Long boardId, String title, String content, String imgUrl, LocalDateTime createdAt,
                       LocalDateTime updatedAt, Status status, List<String> language) {
        super(boardId, title, content, imgUrl, createdAt, updatedAt);
        this.setStatus(status);
        this.language = language;
        this.setUser(user);
        this.setBoardType(BoardType.CODING);
    }
}
