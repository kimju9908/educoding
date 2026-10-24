package com.kh.totalproject.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;

/**
 * 인증 문자 발송 (CoolSMS v4, HMAC-SHA256 서명 인증).
 *
 * COOLSMS_API_KEY 등이 설정돼 있지 않으면 "로컬 개발 모드"로 동작한다 — 실제 문자를 보내지 않고
 * 인증번호를 서버 로그에만 남긴다. 실제 키 없이도 로컬에서 회원가입 흐름을 끝까지 테스트할 수 있게 하기 위함.
 */
@Slf4j
@Service
public class SmsService {
    private static final int TIMEOUT_MS = 3000;

    private final RestClient restClient;
    private final String apiKey;
    private final String apiSecret;
    private final String senderNumber;

    public SmsService(@Value("${coolsms.api-key:}") String apiKey,
                      @Value("${coolsms.api-secret:}") String apiSecret,
                      @Value("${coolsms.sender-number:}") String senderNumber) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.senderNumber = senderNumber;

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(TIMEOUT_MS);
        factory.setReadTimeout(TIMEOUT_MS);
        this.restClient = RestClient.builder()
                .baseUrl("https://api.coolsms.co.kr")
                .requestFactory(factory)
                .build();
    }

    public boolean isDevMode() {
        return apiKey.isBlank() || apiSecret.isBlank() || senderNumber.isBlank();
    }

    /** 발송 실패 시 IllegalStateException (컨트롤러에서 503으로 변환) */
    public void sendVerificationCode(String phoneNumber, String code) {
        if (isDevMode()) {
            log.warn("[SmsService][로컬 개발 모드] 실제 문자는 보내지 않음 — {} 인증번호: {}", phoneNumber, code);
            return;
        }

        String date = OffsetDateTime.now().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
        String salt = UUID.randomUUID().toString().replace("-", "");
        String authorization = "HMAC-SHA256 apiKey=" + apiKey + ", date=" + date + ", salt=" + salt
                + ", signature=" + sign(date + salt);
        Map<String, Object> body = Map.of("message", Map.of(
                "to", phoneNumber,
                "from", senderNumber,
                "text", "[educoding] 인증번호 [" + code + "]를 입력해 주세요."));

        try {
            CoolSmsResponse response = restClient.post()
                    .uri("/messages/v4/send")
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Authorization", authorization)
                    .body(body)
                    .retrieve()
                    .body(CoolSmsResponse.class);
            if (response != null && response.statusCode() != null && !"2000".equals(response.statusCode())) {
                log.error("[SmsService] 문자 발송 실패: statusCode={}, message={}", response.statusCode(), response.statusMessage());
                throw new IllegalStateException("인증 문자 발송에 실패했습니다.");
            }
        } catch (RestClientException e) {
            log.error("[SmsService] 문자 발송 API 호출 실패", e);
            throw new IllegalStateException("인증 문자 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        }
    }

    private String sign(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(apiSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("문자 발송 서명 생성에 실패했습니다.", e);
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record CoolSmsResponse(String groupId, String statusCode, String statusMessage) {}
}
