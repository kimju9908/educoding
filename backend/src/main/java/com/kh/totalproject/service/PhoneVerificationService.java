package com.kh.totalproject.service;

import com.kh.totalproject.entity.PhoneVerification;
import com.kh.totalproject.exception.DuplicateResourceException;
import com.kh.totalproject.exception.InvalidValueException;
import com.kh.totalproject.repository.PhoneVerificationRepository;
import com.kh.totalproject.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.regex.Pattern;

/**
 * 회원가입 휴대폰 인증: 발송(60초 쿨다운, 10분 유효) → 확인(통과 시 30분 동안 가입 가능) → 가입 시 소모.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class PhoneVerificationService {
    private static final Pattern PHONE_PATTERN = Pattern.compile("^01[016789][0-9]{7,8}$");
    private static final Duration CODE_TTL = Duration.ofMinutes(10);
    private static final Duration VERIFIED_TTL = Duration.ofMinutes(30);
    private static final Duration RESEND_COOLDOWN = Duration.ofSeconds(60);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final PhoneVerificationRepository phoneVerificationRepository;
    private final UserRepository userRepository;
    private final SmsService smsService;

    /** "010-1234-5678" → "01012345678". 형식이 틀리면 400 */
    public static String normalize(String phoneNumber) {
        String digits = phoneNumber == null ? "" : phoneNumber.replaceAll("[^0-9]", "");
        if (!PHONE_PATTERN.matcher(digits).matches()) {
            throw new InvalidValueException("올바른 휴대폰 번호를 입력해 주세요.");
        }
        return digits;
    }

    public void sendCode(String rawPhoneNumber) {
        String phone = normalize(rawPhoneNumber);
        if (userRepository.existsByPhoneNumber(phone)) {
            throw new DuplicateResourceException("이미 가입된 휴대폰 번호입니다.");
        }
        LocalDateTime now = LocalDateTime.now();
        PhoneVerification verification = phoneVerificationRepository.findByPhoneNumber(phone).orElse(null);
        if (verification != null && verification.getSentAt().plus(RESEND_COOLDOWN).isAfter(now)) {
            long wait = Duration.between(now, verification.getSentAt().plus(RESEND_COOLDOWN)).toSeconds() + 1;
            throw new InvalidValueException(wait + "초 후에 다시 요청해 주세요.");
        }
        String code = String.format("%06d", RANDOM.nextInt(1_000_000));
        if (verification == null) {
            verification = PhoneVerification.builder().phoneNumber(phone).build();
        }
        verification.setCode(code);
        verification.setSentAt(now);
        verification.setExpiresAt(now.plus(CODE_TTL));
        verification.setVerified(false);
        phoneVerificationRepository.save(verification);

        smsService.sendVerificationCode(phone, code); // 실패하면 예외 → 트랜잭션 롤백
    }

    public void verifyCode(String rawPhoneNumber, String code) {
        String phone = normalize(rawPhoneNumber);
        PhoneVerification verification = phoneVerificationRepository.findByPhoneNumber(phone)
                .orElseThrow(() -> new InvalidValueException("인증번호를 먼저 요청해 주세요."));
        if (verification.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidValueException("인증번호가 만료되었습니다. 다시 요청해 주세요.");
        }
        if (code == null || !verification.getCode().equals(code.trim())) {
            throw new InvalidValueException("인증번호가 일치하지 않습니다.");
        }
        verification.setVerified(true);
        verification.setExpiresAt(LocalDateTime.now().plus(VERIFIED_TTL));
    }

    /** 회원가입 직전에 호출 — 인증을 통과한 번호가 아니면 400, 맞으면 인증 기록을 소모(삭제) */
    public String requireVerifiedAndConsume(String rawPhoneNumber) {
        String phone = normalize(rawPhoneNumber);
        PhoneVerification verification = phoneVerificationRepository.findByPhoneNumber(phone)
                .filter(PhoneVerification::getVerified)
                .filter(v -> v.getExpiresAt().isAfter(LocalDateTime.now()))
                .orElseThrow(() -> new InvalidValueException("휴대폰 인증을 완료해 주세요."));
        phoneVerificationRepository.delete(verification);
        return phone;
    }
}
