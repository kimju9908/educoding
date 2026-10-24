package com.kh.totalproject.repository;

import com.kh.totalproject.entity.OtpVerificationForJoin;
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
public interface EmailValidationForJoinRepository extends JpaRepository<OtpVerificationForJoin, Long> {
    Optional<OtpVerificationForJoin> findByOtpAndEmail(Integer otp, String email);
    Optional<OtpVerificationForJoin> findByEmail(String email);
    @Modifying
    @Query("DELETE FROM OtpVerificationForJoin o WHERE o.email = :email")
    void deleteByEmail(@Param("email") String email);
    // 만료된 OTP 삭제
    @Modifying
    @Query("DELETE FROM OtpVerificationForJoin ovj WHERE ovj.expirationDate < :currentTime")
    void deleteExpiredOtp(@Param("currentTime") Date currentTime);
}
