package com.kh.totalproject.service;

import com.kh.totalproject.dto.MailBody;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender javaMailSender;

    public void sendVerificationEmail(MailBody mailBody) {
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(mailBody.to());
            helper.setFrom("no-reply@example.com"); // 실제 발신 이메일 주소를 설정
            helper.setSubject(mailBody.subject());
            helper.setText(mailBody.html(), true); // true: HTML 형식으로 전송
            javaMailSender.send(mimeMessage);
        } catch (Exception e) {
            throw new RuntimeException("메일 발송 중 오류 발생", e);
        }
    }
}
