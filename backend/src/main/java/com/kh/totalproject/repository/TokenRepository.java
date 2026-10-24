package com.kh.totalproject.repository;

import com.kh.totalproject.entity.Token;
import com.kh.totalproject.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TokenRepository extends JpaRepository<Token, Long> {
    Optional<Token> findByRefreshToken(String refreshToken);
    @Modifying
    @Query("DELETE FROM Token t WHERE t.user.userKey = :userKey")
    void deleteByUserKey(@Param("userKey") Long userKey);

    Optional<Token> findByUserUserKey(Long userKey);  // User의 userKey를 참조하도록 수정
}
