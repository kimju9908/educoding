package com.kh.totalproject.github;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.interfaces.RSAPrivateKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;

/** Parses the GitHub App's private key PEM (PKCS#8 only -- GitHub hands out
 * PKCS#1, see docs/github-diagnosis.md section 6 for the one-time `openssl
 * pkcs8` conversion). No Bouncy Castle dependency added just for this one
 * conversion; failing fast with the exact command to run is simpler and keeps
 * this feature's dependency footprint the same as the rest of the service. */
final class GithubPrivateKeyLoader {
    private GithubPrivateKeyLoader() {}

    static RSAPrivateKey load(String path) {
        String pem;
        try {
            pem = Files.readString(Path.of(path));
        } catch (IOException e) {
            throw new IllegalStateException("GitHub App 개인키 파일을 읽을 수 없습니다: " + path, e);
        }
        if (pem.contains("BEGIN RSA PRIVATE KEY")) {
            throw new IllegalStateException(
                    "GitHub App 개인키가 PKCS#1 형식입니다. 다음 명령으로 한 번 변환한 뒤 그 파일을 "
                            + "github.app.private-key-path에 지정하세요: "
                            + "openssl pkcs8 -topk8 -nocrypt -in original.pem -out pkcs8.pem");
        }
        String base64 = pem.replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s", "");
        try {
            byte[] der = Base64.getDecoder().decode(base64);
            KeyFactory factory = KeyFactory.getInstance("RSA");
            return (RSAPrivateKey) factory.generatePrivate(new PKCS8EncodedKeySpec(der));
        } catch (InvalidKeySpecException | NoSuchAlgorithmException | IllegalArgumentException e) {
            throw new IllegalStateException("GitHub App 개인키(PKCS#8 PEM)를 파싱할 수 없습니다: " + path, e);
        }
    }
}
