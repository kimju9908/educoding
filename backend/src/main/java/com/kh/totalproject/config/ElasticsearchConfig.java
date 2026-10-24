package com.kh.totalproject.config;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.json.jackson.JacksonJsonpMapper;
import co.elastic.clients.transport.ElasticsearchTransport;
import co.elastic.clients.transport.rest_client.RestClientTransport;
import io.github.cdimascio.dotenv.Dotenv;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.HttpHost;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Objects;

@Slf4j
@Configuration
public class ElasticsearchConfig {

    @Bean
    public ElasticsearchClient elasticsearchClient() {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

        String elasticsearchUri = dotenv.get("ELASTIC_END_POINT", System.getenv("ELASTIC_END_POINT"));
        String username = dotenv.get("ELASTIC_USERNAME", System.getenv("ELASTIC_USERNAME"));
        String password = dotenv.get("ELASTIC_PASSWORD", System.getenv("ELASTIC_PASSWORD"));

        if (Objects.equals(username, "") && Objects.equals(password, "")){
            // RestClientBuilder로 클러스터 노드 설정
            RestClientBuilder restClientBuilder = RestClient.builder(HttpHost.create(elasticsearchUri));

            // RestClient 생성
            RestClient restClient = restClientBuilder.build();

            // ElasticsearchClient를 만들기 위한 새로운 설정 방식 (RestClient로부터 ElasticsearchTransport 생성)
            ElasticsearchTransport transport = new RestClientTransport(
                    restClient, new JacksonJsonpMapper());

            // ElasticsearchClient 생성

            return new ElasticsearchClient(transport);
        }
        else {
        // 인증 정보 설정
        BasicCredentialsProvider credentialsProvider = new BasicCredentialsProvider();
        credentialsProvider.setCredentials(AuthScope.ANY, new UsernamePasswordCredentials(username, password));

        // RestClientBuilder에 인증 정보 추가
        RestClientBuilder restClientBuilder = RestClient.builder(HttpHost.create(elasticsearchUri))
                .setHttpClientConfigCallback(httpClientBuilder -> httpClientBuilder.setDefaultCredentialsProvider(credentialsProvider));

        // RestClient 생성
        RestClient restClient = restClientBuilder.build();

        // ElasticsearchClient 를 만들기 위한 새로운 설정 방식
        ElasticsearchTransport transport = new RestClientTransport(restClient, new JacksonJsonpMapper());

        // ElasticsearchClient 생성
        return new ElasticsearchClient(transport);
        }
    }
}


