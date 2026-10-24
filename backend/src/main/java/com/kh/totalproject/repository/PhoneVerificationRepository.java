package com.kh.totalproject.repository;

import com.kh.totalproject.entity.PhoneVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PhoneVerificationRepository extends JpaRepository<PhoneVerification, Long> {
    Optional<PhoneVerification> findByPhoneNumber(String phoneNumber);
}
