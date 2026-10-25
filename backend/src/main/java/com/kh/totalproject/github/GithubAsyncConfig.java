package com.kh.totalproject.github;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/** This feature's own executor -- no other AI feature in this codebase runs
 * truly in the background (learning path/review/hint all answer synchronously
 * within the request, see their *Client.java read timeouts). GitHub diagnosis
 * needs real background execution (section 5 of docs/github-diagnosis.md:
 * MCP + up to 18 Claude calls across up to 3 repos can run well past what's
 * reasonable to hold an HTTP request open for), so it gets its own small pool
 * rather than @EnableAsync's shared default. */
@Configuration
@EnableAsync
public class GithubAsyncConfig {
    public static final String EXECUTOR_NAME = "githubAnalysisExecutor";

    @Bean(EXECUTOR_NAME)
    public Executor githubAnalysisExecutor() {
        var executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(4);
        executor.setQueueCapacity(20);
        executor.setThreadNamePrefix("github-analysis-");
        executor.initialize();
        return executor;
    }
}
