package com.kh.totalproject.github;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.security.interfaces.RSAPrivateKey;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/** Thin wrapper over the GitHub REST/OAuth endpoints this feature needs. The
 * installation token this mints is scoped by the App's own permissions
 * (Contents:read, Metadata:read only -- see docs/github-diagnosis.md section 6)
 * and by the installation's own repo selection; no caller-supplied owner/repo
 * reaches a GitHub call here without GithubConnectionService having already
 * checked it against the connection's own installation. */
@Component
public class GithubAppClient {
    private static final String API_BASE = "https://api.github.com";
    private static final String GITHUB_BASE = "https://github.com";

    private final GithubAppProperties properties;
    private final ObjectMapper mapper;
    private final RestTemplate rest;
    private volatile RSAPrivateKey privateKey;

    public GithubAppClient(GithubAppProperties properties, ObjectMapper mapper) {
        this.properties = properties;
        this.mapper = mapper;
        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(5));
        factory.setReadTimeout(Duration.ofSeconds(15));
        this.rest = new RestTemplate(factory);
    }

    private RSAPrivateKey privateKey() {
        RSAPrivateKey key = privateKey;
        if (key == null) {
            synchronized (this) {
                key = privateKey;
                if (key == null) {
                    key = GithubPrivateKeyLoader.load(properties.privateKeyPath());
                    privateKey = key;
                }
            }
        }
        return key;
    }

    /** App-level JWT (RS256) -- used only to mint installation tokens / read
     * installation metadata. Never sent anywhere outside this class, never logged. */
    String appJwt() {
        Date now = new Date();
        return Jwts.builder()
                .issuer(properties.appId())
                .issuedAt(new Date(now.getTime() - 60_000)) // backdated for clock drift, per GitHub's own guidance
                .expiration(new Date(now.getTime() + 9 * 60_000)) // GitHub's hard cap is 10 minutes
                .signWith(privateKey(), SignatureAlgorithm.RS256)
                .compact();
    }

    /** Freshly minted, short-TTL token for exactly one analysis run or auto-commit job.
     * Never persisted -- the caller uses it once and discards it (see
     * docs/github-diagnosis.md section 5 / docs/github-auto-commit.md section 1). */
    public String createInstallationToken(long installationId) {
        var response = rest.exchange(API_BASE + "/app/installations/" + installationId + "/access_tokens",
                HttpMethod.POST, new HttpEntity<>(authHeaders(appJwt())), String.class);
        String token = field(response.getBody(), "token");
        if (token == null) throw new IllegalStateException("GitHub 설치 토큰 발급에 실패했습니다.");
        return token;
    }

    public record GithubIdentity(long id, String login) {}

    /** Exchanges the OAuth `code` for a user-to-server token, resolves the identity,
     * and discards the token immediately -- it is never stored (section 1). Use
     * {@link #exchangeCodeForUserToken} instead when the caller also needs
     * {@link #listUserInstallationIds} from the SAME token -- a `code` is single-use,
     * so it must only ever be exchanged once per callback. */
    public GithubIdentity resolveIdentity(String code) {
        return getUser(exchangeCodeForUserToken(code));
    }

    public String exchangeCodeForUserToken(String code) {
        var headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        var body = Map.of("client_id", properties.clientId(), "client_secret", properties.clientSecret(), "code", code);
        var response = rest.exchange(GITHUB_BASE + "/login/oauth/access_token", HttpMethod.POST,
                new HttpEntity<>(body, headers), String.class);
        String token = field(response.getBody(), "access_token");
        if (token == null) throw new IllegalStateException("GitHub OAuth code 교환에 실패했습니다.");
        return token;
    }

    public GithubIdentity getUser(String userToken) {
        var response = rest.exchange(API_BASE + "/user", HttpMethod.GET, new HttpEntity<>(authHeaders(userToken)), String.class);
        JsonNode node = readTree(response.getBody());
        return new GithubIdentity(node.path("id").asLong(), node.path("login").asText());
    }

    /** The installations this user token's owner can actually see. Cross-checked by
     * GithubConnectionService against the installation_id GitHub's install callback
     * supplied, so an installation can't be claimed by guessing its id. Takes the
     * token directly (not a `code`) so it can share one exchange with {@link #getUser}
     * -- a `code` is single-use. */
    public List<Long> listUserInstallationIds(String userToken) {
        var response = rest.exchange(API_BASE + "/user/installations?per_page=100", HttpMethod.GET,
                new HttpEntity<>(authHeaders(userToken)), String.class);
        JsonNode installations = readTree(response.getBody()).path("installations");
        List<Long> ids = new ArrayList<>();
        installations.forEach(n -> ids.add(n.path("id").asLong()));
        return ids;
    }

    // hasContentsWrite reflects THIS installation's actually-granted permission right now
    // (permissions.contents == "write") -- used only to decide what to show in the UI
    // (docs/github-auto-commit.md section 1). The upload path re-derives this live from
    // the same call right before writing; it never trusts a cached copy of this value.
    public record InstallationInfo(String accountLogin, String accountType, boolean hasContentsWrite) {}

    public InstallationInfo getInstallation(long installationId) {
        var response = rest.exchange(API_BASE + "/app/installations/" + installationId, HttpMethod.GET,
                new HttpEntity<>(authHeaders(appJwt())), String.class);
        JsonNode body = readTree(response.getBody());
        JsonNode account = body.path("account");
        boolean hasContentsWrite = "write".equals(body.path("permissions").path("contents").asText(null));
        return new InstallationInfo(account.path("login").asText(), account.path("type").asText(), hasContentsWrite);
    }

    public record RepoRef(long repoId, String owner, String name, String defaultBranch) {}

    public List<RepoRef> listInstallationRepositories(String installationToken) {
        List<RepoRef> all = new ArrayList<>();
        for (int page = 1; page <= 3; page++) { // cap: 300 repos is far beyond the 1-3 this feature ever analyzes
            var response = rest.exchange(API_BASE + "/installation/repositories?per_page=100&page=" + page,
                    HttpMethod.GET, new HttpEntity<>(authHeaders(installationToken)), String.class);
            JsonNode repos = readTree(response.getBody()).path("repositories");
            if (!repos.isArray() || repos.isEmpty()) break;
            for (JsonNode r : repos) {
                all.add(new RepoRef(r.path("id").asLong(), r.path("owner").path("login").asText(),
                        r.path("name").asText(), r.path("default_branch").asText()));
            }
            if (repos.size() < 100) break;
        }
        return all;
    }

    /** The exact commit an analysis run pins to -- a push during analysis can't move
     * the result out from under it (section 3). */
    public String getDefaultBranchHeadSha(String installationToken, String owner, String repo, String branch) {
        var response = rest.exchange(API_BASE + "/repos/" + owner + "/" + repo + "/commits/" + branch,
                HttpMethod.GET, new HttpEntity<>(authHeaders(installationToken)), String.class);
        return readTree(response.getBody()).path("sha").asText();
    }

    public record RecentCommit(String sha, String message) {}

    /** Used only on a RETRY after a TRANSIENT failure (timeout/rate-limit/5xx) whose
     * actual outcome on GitHub's side is unknown -- checks whether our own earlier
     * attempt's commit actually landed before trying to write again, so a flaky
     * network response never produces two commits for one job (docs/github-auto-commit.md
     * section 6). Matches on the exact commit message AutoCommitJobRunner always
     * generates deterministically from the job's own data. */
    public Optional<RecentCommit> findMatchingRecentCommit(String installationToken, String owner, String repo,
                                                            String branch, String path, String expectedMessage) {
        var response = rest.exchange(
                API_BASE + "/repos/" + owner + "/" + repo + "/commits?sha=" + branch + "&path=" + path + "&per_page=1",
                HttpMethod.GET, new HttpEntity<>(authHeaders(installationToken)), String.class);
        JsonNode commits = readTree(response.getBody());
        if (!commits.isArray() || commits.isEmpty()) return Optional.empty();
        JsonNode first = commits.get(0);
        String message = first.path("commit").path("message").asText("");
        if (!message.equals(expectedMessage)) return Optional.empty();
        return Optional.of(new RecentCommit(first.path("sha").asText(), message));
    }

    private HttpHeaders authHeaders(String token) {
        var headers = new HttpHeaders();
        headers.set(HttpHeaders.AUTHORIZATION, "Bearer " + token);
        headers.set("Accept", "application/vnd.github+json");
        headers.set("X-GitHub-Api-Version", "2022-11-28");
        return headers;
    }

    private JsonNode readTree(String body) {
        try {
            return mapper.readTree(body);
        } catch (Exception e) {
            throw new IllegalStateException("GitHub API 응답을 해석할 수 없습니다.", e);
        }
    }

    private String field(String body, String name) {
        JsonNode node = readTree(body).path(name);
        return node.isMissingNode() || node.isNull() ? null : node.asText();
    }
}
