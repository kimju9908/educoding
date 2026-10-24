package com.kh.totalproject.service;

import com.kh.totalproject.constant.codechallenge.enums.CodeChallengeLanguage;
import com.kh.totalproject.constant.webhook.FlaskApiPath;
import com.kh.totalproject.constant.webhook.FlaskProperties;
import com.kh.totalproject.dto.flask.request.CreateJobRequest;
import com.kh.totalproject.dto.flask.request.JobOperationRequest;
import com.kh.totalproject.dto.flask.response.ErrorResponse;
import com.kh.totalproject.dto.flask.response.JobCreationResponse;
import com.kh.totalproject.dto.flask.response.JobExecutionResponse;
import com.kh.totalproject.dto.response.ExecuteJudgeJobResponse;
import com.kh.totalproject.dto.response.CreateJudgeJobResponse;
import com.kh.totalproject.exception.CustomHttpClientErrorException;
import com.kh.totalproject.exception.CustomHttpMessageNotReadableException;
import com.kh.totalproject.exception.CustomHttpServerErrorException;
import com.kh.totalproject.exception.InvalidResponseBodyException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

@RequiredArgsConstructor
@Service
@Slf4j
public class CodeChallengeJudgeJobService {
    private final RestTemplate restTemplate;
    private final FlaskProperties flaskProperties;

    public CreateJudgeJobResponse createJudgeJob(Long challengeId, Long userKey, String code, CodeChallengeLanguage codeLanguage) {
        CreateJobRequest flaskRequestPayload = CreateJobRequest.builder()
                .challengeId(challengeId)
                .userId(userKey)
                .code(code)
                .codeLanguage(codeLanguage)
                .build();

        JobCreationResponse response = sendRequestToFlask(FlaskApiPath.CREATE_JOB, flaskRequestPayload, HttpMethod.POST, JobCreationResponse.class);

        if (response == null || response.jobId() == null || response.jobId().isEmpty()) {
            throw new InvalidResponseBodyException("채점 작업 생성 요청에 대한 응답 본문에서 \"jobId\" 필드의 값을 가져올 수 없습니다.");
        }

        return new CreateJudgeJobResponse(response.jobId());
    }

    public boolean isJudgeJobExists(String jobId, Long userKey) {
        JobOperationRequest flaskRequestPayload = JobOperationRequest.builder()
                .jobId(jobId)
                .userId(userKey)
                .build();

        // 추후 HEAD로 바꾸고 쿼리 파람으로 처리하도록 수정
        try {
            sendRequestToFlask(FlaskApiPath.GET_JOB, flaskRequestPayload, HttpMethod.POST, Object.class);
            return true;
        } catch (CustomHttpClientErrorException | CustomHttpServerErrorException e) {
            return false;
        }
    }

    public ExecuteJudgeJobResponse executeJudgeJobViaWebhook(String jobId, Long userKey) {
        JobOperationRequest flaskRequestPayload = JobOperationRequest.builder()
                .jobId(jobId)
                .userId(userKey)
                .build();

        // 비동기적으로 작업 실행 웹훅 요청, 이 요청에서 대해 Flask API는 단순히 테스트 케이스 갯수만 반환
        // 클라이언트는 해당 테스트 케이스 갯수에 대해 수신할 준비(SSE 연결)이 되어 있는 상태
        JobExecutionResponse response = sendRequestToFlask(FlaskApiPath.EXECUTE_JOB, flaskRequestPayload, HttpMethod.POST, JobExecutionResponse.class);
        if (response == null) {
            throw new InvalidResponseBodyException("채점 작업 실행 요청에 대한 응답 본문에서 \"totalTestCases\" 필드의 값을 가져올 수 없습니다");
        }

        return new ExecuteJudgeJobResponse(response.totalTestCases());
    }

    public void cancelJudgeJobViaWebhook(String jobId, Long userKey) {
        JobOperationRequest flaskRequestPayload = JobOperationRequest.builder()
                .jobId(jobId)
                .userId(userKey)
                .build();
        // 비동기적으로 작업 정리 요청
        sendRequestToFlask(FlaskApiPath.CANCEL_JOB, flaskRequestPayload, HttpMethod.POST, Object.class);
    }

    private <T> T sendRequestToFlask(String path, Object body, HttpMethod method, Class<T> responseType) {
        // HTTP Header 설정
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        headers.set("X-Api-Key", flaskProperties.apiKey());
        headers.set("X-Client-Id", flaskProperties.clientId());

        // HTTP 요청 객체 생성
        HttpEntity<Object> requestEntity;
        if (body == null) {
            requestEntity = new HttpEntity<>(headers);
        } else {
            requestEntity = new HttpEntity<>(body, headers);
        }

        String requestUrl = flaskProperties.host() + path;

        try {
            ResponseEntity<T> flaskResponse = restTemplate.exchange(requestUrl, method, requestEntity, responseType);
            return flaskResponse.getBody();
        }
        catch (HttpMessageNotReadableException e) {
            log.error("Failed to parse response from Flask API: {}", e.getMessage());
            throw new CustomHttpMessageNotReadableException(e, requestUrl);
        }
        catch (HttpClientErrorException e) {
            // 4xx 응답 처리
            try {
                ErrorResponse errorResponse = e.getResponseBodyAs(ErrorResponse.class);
                if (errorResponse != null) {
                    log.error("Client error({}) from Flask API: {} - Error: {}", e.getStatusCode(), requestUrl, errorResponse.error());
                } else {
                    log.error("Client error({}) from Flask API: {}", e.getStatusCode(), requestUrl);
                }
            } catch (Exception ex) {
                log.error("Client error({}) from Flask API: {} - Failed to parse error response: {}", e.getStatusCode(), requestUrl, ex.getMessage());
            }
            throw new CustomHttpClientErrorException(e, requestUrl);
        }
        catch (HttpServerErrorException e) {
            // 5xx 응답 처리
            try {
                ErrorResponse errorResponse = e.getResponseBodyAs(ErrorResponse.class);
                if (errorResponse != null) {
                    log.error("Server error({}) from Flask API: {} - Error: {}", e.getStatusCode(), requestUrl, errorResponse.error());
                } else {
                    log.error("Server error({}) from Flask API: {}", e.getStatusCode(), requestUrl);
                }
            } catch (Exception ex) {
                log.error("Server error({}) from Flask API: {} - Failed to parse error response: {}", e.getStatusCode(), requestUrl, ex.getMessage());
            }
            throw new CustomHttpServerErrorException(e, requestUrl);
        }
    }
}

