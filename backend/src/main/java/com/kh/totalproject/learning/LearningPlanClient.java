package com.kh.totalproject.learning;

import com.kh.totalproject.constant.rag.RagProperties;
import org.springframework.stereotype.Component;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;
import java.time.Duration;
import static com.kh.totalproject.learning.LearningModels.*;

@Component
public class LearningPlanClient {
    private final RagProperties properties;
    private final RestTemplate rest;
    public LearningPlanClient(RagProperties properties) {
        this.properties=properties;
        var factory=new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(5)); factory.setReadTimeout(Duration.ofSeconds(95));
        rest=new RestTemplate(factory);
    }
    public Selection generate(Snapshot snapshot) {
        if(properties.anthropicApiKey()==null || properties.anthropicApiKey().isBlank()) throw new IllegalStateException("AI unavailable");
        var headers=new HttpHeaders(); headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Anthropic-Api-Key",properties.anthropicApiKey());
        if(properties.apiKey()!=null && !properties.apiKey().isBlank()) {
            headers.set("X-Api-Key",properties.apiKey()); headers.set("X-Client-Id",properties.clientId());
        }
        return rest.exchange(properties.host()+"/learning-path/generate",HttpMethod.POST,
                new HttpEntity<>(snapshot,headers),Selection.class).getBody();
    }
}
