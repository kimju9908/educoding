package com.kh.totalproject.github;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** GitHub App credentials, read the same way RagProperties/JwtConfig are --
 * env-backed, never logged, never sent to the model or the browser. Left blank
 * in local dev (the feature then reports "not configured" instead of 500ing --
 * see GithubConnectionService). See docs/github-diagnosis.md section 6 for how
 * to create the App and fill these in. */
@Component
public class GithubAppProperties {
    @Value("${github.app.id:}") private String appId;
    @Value("${github.app.slug:}") private String appSlug;
    @Value("${github.app.client-id:}") private String clientId;
    @Value("${github.app.client-secret:}") private String clientSecret;
    // PKCS#8 PEM path -- GitHub hands out PKCS#1; convert once with
    // `openssl pkcs8 -topk8 -nocrypt -in original.pem -out pkcs8.pem`.
    @Value("${github.app.private-key-path:}") private String privateKeyPath;
    // Reuses the same DOMAIN_URL already used for CORS -- where the frontend lives,
    // so the OAuth/install callbacks know where to redirect the browser back to.
    @Value("${DOMAIN_URL:}") private String domainUrl;

    public String appId() { return appId; }
    public String appSlug() { return appSlug; }
    public String clientId() { return clientId; }
    public String clientSecret() { return clientSecret; }
    public String privateKeyPath() { return privateKeyPath; }
    public String domainUrl() { return domainUrl; }

    public boolean configured() {
        return !blank(appId) && !blank(appSlug) && !blank(clientId) && !blank(clientSecret) && !blank(privateKeyPath);
    }
    private boolean blank(String s) { return s == null || s.isBlank(); }
}
