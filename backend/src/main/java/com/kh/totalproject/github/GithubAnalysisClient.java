package com.kh.totalproject.github;

import com.kh.totalproject.constant.rag.RagApiPath;
import com.kh.totalproject.constant.rag.RagProperties;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

import static com.kh.totalproject.github.GithubModels.DiagnoseRequest;
import static com.kh.totalproject.github.GithubModels.DiagnoseResponse;

/** Calls rag/service's /github/diagnose -- same host/service auth as
 * LearningPlanClient, plus the installation token on its own header (never in
 * the request body, same rule as X-Anthropic-Api-Key). Long read timeout: the
 * agent loop's own budget is ~240s (RAG_GITHUB_TIME_BUDGET_SECONDS); this must
 * outlast it so a slow-but-finishing run gets a real answer, not a timeout. */
@Component
public class GithubAnalysisClient {
    private final RagProperties properties;
    private final RestTemplate rest;

    public GithubAnalysisClient(RagProperties properties) {
        this.properties = properties;
        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(5));
        factory.setReadTimeout(Duration.ofSeconds(280));
        this.rest = new RestTemplate(factory);
    }

    public DiagnoseResponse diagnose(DiagnoseRequest request, String installationToken) {
        if (properties.anthropicApiKey() == null || properties.anthropicApiKey().isBlank())
            throw new IllegalStateException("AI unavailable");
        var headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Anthropic-Api-Key", properties.anthropicApiKey());
        headers.set("X-Github-Installation-Token", installationToken);
        if (properties.apiKey() != null && !properties.apiKey().isBlank()) {
            headers.set("X-Api-Key", properties.apiKey());
            headers.set("X-Client-Id", properties.clientId());
        }
        return rest.exchange(properties.host() + RagApiPath.GITHUB_DIAGNOSE, HttpMethod.POST,
                new HttpEntity<>(request, headers), DiagnoseResponse.class).getBody();
    }
}
