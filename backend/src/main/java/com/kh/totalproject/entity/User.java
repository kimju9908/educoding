package com.kh.totalproject.entity;

import com.kh.totalproject.constant.Role;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

// 실제 이름 포함?
// 프로필 이미지 추가?
// Refresh Token 데이터베이스에 저장 필요?
@Entity
@Table(name = "user", uniqueConstraints = {
        @UniqueConstraint(name = "unique_email_combination", columnNames = {"email", "googleemail", "kakaoemail", "naveremail"})
})
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@ToString(exclude = {"boards", "comments"})
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="user_key")
    private Long userKey;

    @Column(nullable = false, unique = true, length = 30)
    @Size(min = 5, max = 30, message = "아이디는 5자 이상, 30자 이하 (영어 기준)")
    private String userId;

    @Column(nullable = false, unique = true, length = 30)
    @Size(min = 3, max = 50, message = "닉네임은 1자 이상, 16자 이하(한글 기준)")
    private String nickname;

    @Column(nullable = false, length = 50)
    @Size(min = 5, max = 50, message = "이메일은 5자 이상, 50자 이하(영어 기준)")
    private String email;

    @Column(nullable = true, length = 200)
    private String profileUrl;
    @Column(nullable = true, length = 500)
    private String introduction;

    // 회원가입 시 받는 실명/생년월일/휴대폰 (소셜 로그인·기존 회원은 비어 있을 수 있어 nullable)
    @Column(length = 30)
    private String name;

    private LocalDate birthDate;

    // 하이픈 없이 숫자만 저장 (01012345678)
    @Column(unique = true, length = 20)
    private String phoneNumber;


    // 암호화 하기 때문에 max 값 255로 설정
    @Column()
    @Size(min = 8, max = 255, message = "비밀번호는 8자 이상, 50자 이하")
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    @PrePersist
    private void prePersist(){
        if (role == null){
            this.role = Role.USER;
        }
        //else this.role = Role.ADMIN;      // null 이 아닐때도 기본값이 ADMIN 이라 주석처리
    }

    // 구글, 카카오, 네이버 소셜 로그인 ID
    @Column(length = 100, nullable = true)
    private String googleemail;

    @Column(length = 100, nullable = true)
    private String kakaoemail;

    @Column(length = 100, nullable = true)
    private String naveremail;

    // 게시판 연관관계
    @OneToMany(mappedBy = "user", cascade = CascadeType.REMOVE)
    @Builder.Default
    private List<Board> boards = new ArrayList<>();

    // 댓글 연관관계
    @OneToMany(mappedBy = "user", cascade = CascadeType.REMOVE)
    @Builder.Default
    private List<Comment> comments = new ArrayList<>();

    // 게시글 반응 연관관계
    @OneToMany(mappedBy = "user", cascade = CascadeType.REMOVE)
    @Builder.Default
    private List<BoardReaction> boardReactions = new ArrayList<>();

    // 신고 게시판 연관관계
    @OneToMany(mappedBy = "user", cascade = CascadeType.REMOVE)
    @Builder.Default
    private List<ReportBoard> reportBoards  = new ArrayList<>();

    // 신고 게시판에 해당하는 댓글 연관관계
    @OneToMany(mappedBy = "user", cascade = CascadeType.REMOVE)
    @Builder.Default
    private List<ReportComment> reportComments = new ArrayList<>();

    // 멘토 등록에 해당하는 멘토와 연관관계
    @OneToOne(mappedBy = "user", cascade = CascadeType.REMOVE)
    private Mentor mentor;

    @OneToMany(mappedBy = "user", cascade = CascadeType.REMOVE)
    private List<MentorReview> mentorReviews = new ArrayList<>();

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime registeredAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

//    @Builder // NoArgsConstructor 가 있어야함
//    public User(String userId, String email, String nickname, String password, Role role){
//        this.userId = userId;
//        this.email = email;
//        this.password = password;
//        this.nickname = nickname;
//        this.role = role;
//    }

    @Builder
    public User(String userId, String email, String nickname, String password, Role role, String googleEmail, String kakaoEmail, String naverEmail) {
        this.userId = userId;
        this.email = email;
        this.password = password;
        this.nickname = nickname;
        this.role = role;
        this.googleemail = googleEmail;
        this.kakaoemail = kakaoEmail;
        this.naveremail = naverEmail;
    }

    // userKey만 받는 생성자 추가
    @Builder
    public User(Long userKey) {
        this.userKey = userKey;
    }
}
