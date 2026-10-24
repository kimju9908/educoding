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
@Table(name = "study_board")
@Getter
@Setter
@NoArgsConstructor
public class StudyBoard extends Board {


    @Type(JsonType.class)
    @Column(columnDefinition = "json")
    private List<String> study;

    @PrePersist
    private void defaultValues() {

        if (study == null) {
            this.study = new ArrayList<>();
        }
    }

    @Builder
    public StudyBoard(User user, Long boardId, String title, String content, String imgUrl, LocalDateTime createdAt,
                       LocalDateTime updatedAt, Status status, List<String> study) {
        super(boardId, title, content, imgUrl, createdAt, updatedAt);
        this.setStatus(status);
        this.study = study;
        this.setUser(user);
        this.setBoardType(BoardType.STUDY);
    }
}