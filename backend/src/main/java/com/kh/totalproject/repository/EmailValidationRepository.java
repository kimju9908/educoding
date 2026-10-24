package com.kh.totalproject.repository;

import com.kh.totalproject.entity.OtpVerification;
import com.kh.totalproject.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.Optional;

@Repository
@Transactional
public interface EmailValidationRepository extends JpaRepository<OtpVerification, Long> {
    @Query("select ov from OtpVerification ov where ov.otp = ?1 and ov.user = ?2")
    Optional<OtpVerification> findByOtpAndUser(Integer otp, User user);

    // 만료된 OTP 삭제
    @Modifying
    @Query("DELETE FROM OtpVerification ov WHERE ov.expirationDate < :currentTime")
    void deleteExpiredOtp(@Param("currentTime") Date currentTime);

    // 이메일 기반 OTP 삭제
    @Modifying
    @Query("DELETE FROM OtpVerification ov WHERE ov.user.userKey = :userKey")
    void deleteByUserKey(@Param("userKey") Long userKey);
}
