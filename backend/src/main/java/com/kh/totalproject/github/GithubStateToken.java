package com.kh.totalproject.github;

import com.kh.totalproject.config.JwtConfig;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;

/** Signs/verifies the OAuth/install `state` param. The browser round-trips to
 * github.com and back without our Authorization header (see
 * docs/github-diagnosis.md section 1), so this signed, short-lived, single-
 * purpose token -- not a session/cookie -- is what ties the callback back to
 * the user who started it and stops a forged state from linking someone else's
 * account. Reuses the existing jwt.secret-key; this is a separate, narrowly-
 * scoped token type, not an access token (different "purpose" claim, 5-minute
 * expiry, never accepted by JwtFilter since it's verified here, not there). */
@Component @RequiredArgsConstructor
public class GithubStateToken {
    public static final String PURPOSE_OAUTH = "github-oauth";
    public static final String PURPOSE_INSTALL = "github-install";
    private static final long EXPIRY_MILLIS = 5 * 60 * 1000;

    private final JwtConfig jwtConfig;

    public String issue(Long userKey, String purpose) {
        SecretKey key = Keys.hmacShaKeyFor(jwtConfig.getSecretKey().getBytes());
        Date now = new Date();
        return Jwts.builder()
                .subject(String.valueOf(userKey))
                .claim("purpose", purpose)
                .claim("nonce", UUID.randomUUID().toString())
                .issuedAt(now)
                .expiration(new Date(now.getTime() + EXPIRY_MILLIS))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /** @return the userKey this state was issued for, or null if invalid/expired/wrong purpose. */
    public Long verify(String state, String expectedPurpose) {
        if (state == null || state.isBlank()) return null;
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtConfig.getSecretKey().getBytes());
            Claims claims = Jwts.parser().setSigningKey(key).build().parseClaimsJws(state).getBody();
            if (!expectedPurpose.equals(claims.get("purpose"))) return null;
            return Long.valueOf(claims.getSubject());
        } catch (JwtException | IllegalArgumentException e) {
            return null;
        }
    }
}
