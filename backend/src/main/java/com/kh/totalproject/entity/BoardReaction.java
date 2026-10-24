package com.kh.totalproject.entity;

import com.kh.totalproject.constant.Reaction;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "board_reaction")
@Builder
public class BoardReaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reaction_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id", nullable = false)
    private Board board;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_key", nullable = false, referencedColumnName = "user_key")
    private User user;

    @Enumerated(EnumType.STRING)
    private Reaction reaction;
}
