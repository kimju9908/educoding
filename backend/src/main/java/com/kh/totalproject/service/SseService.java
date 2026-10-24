package com.kh.totalproject.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kh.totalproject.dto.callbackevent.JudgeJobError;
import com.kh.totalproject.dto.callbackevent.TestCaseResult;
import com.kh.totalproject.dto.callbackevent.Verdict;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@RequiredArgsConstructor
@Service
@Slf4j
public class SseService {
    /**
     * Java에서 멀티 스레드 환경에서 효율적으로 동작하도록 설계된 Map 인터페이스의 구현체.
     * 하지만 내부 자료형에 대해서 스레드 안전성을 보장하지는 않음
     * Key는 String이고 불변 객체이므로 ConcurrentHashMap을 사용하는 과정에서 read 되는 경우밖에 존재하지 않으므로 안전.
     * 하지만 Value는 SseEmitter 객체이며, SseEmitter 내부적 연산은 스레드 안전성을 보장하지 않음.
     * 예를 들어 한 스레드가 send() 호출 중 다른 스레드가 complete()를 호출하면 IllegalStateException 발생
     * 따라서 SseEmitter 인스턴스의 내부 메서드 및 로직 호출과정은 원자적으로 처리하도록 compute 메서드 활용
     * 추가적으로 극단적인 네트워크 지연 상황에서는 send가 완료되기 전에 complete가 호출될 수 있는지는 생각해볼 것
     */
    private final ConcurrentHashMap<String, SseEmitter> subscriptions = new ConcurrentHashMap<>();

    // Object -> JSON 직렬화를 위해 초기화
    private final ObjectMapper mapper = new ObjectMapper();

    public SseEmitter subscribe(String jobId) {
        // compute를 사용하여 지정된 키(key)에 대해 필요한 로직과 함께 새로운 값을 생성하거나 업데이트.
        // 지정된 Key-Value 쌍에 대해서 주어진 콜백을 원자적으로 처리하도록 보장.
        // 콜백 수행 완료 이전까지 Key-Value 쌍에 대한 get()과 read 작업은 lock 되지 않지만, 콜백 이전의 값을 참조
        // write 작업에 대해서는 lock이 걸리며, 콜백(원자적 작업)이 완료되기 까지 대기.
        // compute는 다음의 과정을 수행.
        // 1. 키 존재 확인
        // 2. 값 조회
        // 3. 콜백 함수 적용(함수 내에서 map의 value를 사용하는 경우 값은 원본 객체의 copy본)
        // 4. 원자적 처리 이후 value는 return 값으로 swap

        // 만약 get() ~ send/complete ~ remove()로 단순하게 구현하면,
        // 1. 동시에 한 인스턴스에 대해 접근하게 되며 send가 여러번 호출(내부 메시지 버퍼 손상 또는 오류) 또는 complete가 여러번 호출되어 예외(IllegalStateException) 발생 하는 등
        //    race condition에 의한 예상치 못한 동작이 발생
        // 2. 한 스레드가 emitter를 complete() 처리하는 동안 다른 스레드가 동일한 emitter에 메시지 전송(send) 시도하면서 오류 발생
        return subscriptions.compute(jobId, (key, emitter) -> {
            // 이미 존재하는 경우 기존 인스턴스 반환
            if (emitter != null) {
                // 원자적 작업의 결과(value) 업데이트
                return emitter;
            }

            emitter = new SseEmitter(120000L);

            /* SseEmitter.complete() 메서드를 호출되었을 때 */
            emitter.onCompletion(() -> {
                log.info("Judge job {} Complete", jobId);
                subscriptions.remove(jobId);
            });

            /*
              설정된 TTL을 초과 했을 때
             * 타임아웃에 국한된 특별한 처리가 필요한 경우 사용 (예: 메트릭 카운터 증가)
             * SseEmitter.onTimeout() 콜백이 실행된 이후 내부적으로 SseEmitter.complete()를 자동 호출
             */
            emitter.onTimeout(() -> {
                log.warn("SSE session timed out for job id: {}", jobId);
                subscriptions.remove(jobId);
            });

            /*
             * 1. 직접적으로 SseEmitter.completeWithError(ex) 메서드를 호출했을 때
             *    - 이 경우 개발자가 명시적으로 에러 상태로 종료하는 것입니다.
             *
             * 2. send()를 동기적으로 처리하는 과정(try-catch로 잡을 수 있는 부분)에서
             *    연결이 유효하지 않아 IOException이 발생하는 경우
             *    - 이때는 개발자가 직접 try-catch로 예외를 잡고 completeWithError()를 호출해야 합니다.
             *
             * 3. send() 호출 후 비동기적으로 버퍼링된 데이터가 네트워크로 전송되는 과정
             *    (코드상 직접 보이지 않는 부분)에서 연결이 유효하지 않아 전송 실패 시
             *    - 이 경우 Spring 내부에서 자동으로 onError 콜백을 트리거합니다.
             *    - 이후 동일 emitter에 send()를 호출하면 IllegalStateException("Emitter already completed") 발생합니다.
             *
             * SseEmitter.onError() 콜백이 실행된 이후 내부적으로 SseEmitter.complete()가 자동 호출됩니다.
             */
            emitter.onError(e -> {
                if (!(e instanceof IOException)) {
                    log.error("Unexpected SSE error for job id: {}",jobId, e);
                }
                subscriptions.remove(jobId);
            });

            // 초기 메시지(data)를 전송하는데,
            // 클라이언트는 SSE 연결 시도 후 아무런 메시지가 없으면
            // 스스로 연결이 되었는지 여부를 판단할 수 없기 때문
            this.sendSseMessage(emitter, "Connection Established", null);

            // 원자적 작업의 결과(value) 업데이트
            return emitter;
        });
    }

    // return 값은 Webhook 워커에게 SSE 메시지 전송 결과/상태에 따라
    // 작업 진행/중단 명령을 전송하기 위해 사용
    public boolean sendTestCaseResult(TestCaseResult event) {
        String jobId = event.jobId();
        Verdict verdict = event.verdict();
        Integer testCaseIndex = verdict.testCaseIndex();

        // computeIfPresent를 사용하여 지정된 키(key)에 대해 필요한 로직과 함께 value를 원자적으로 업데이트.
        return subscriptions.computeIfPresent(jobId, (key, emitter) -> {
            try {
                String jsonPayload = mapper.writeValueAsString(verdict);
                boolean success = this.sendSseMessage(emitter, jsonPayload, testCaseIndex);

                // 원자적 작업의 결과(value) 업데이트
                // null 인 경우 결과는 기존 key-value 쌍이 제거됨
                return success ? emitter : null;
            } catch (JsonProcessingException e) {
                boolean success = this.sendSseMessage(emitter, "error:서버 내부 오류가 발생했습니다", null);
                if (success) emitter.completeWithError(e);

                // 기존 key-value 쌍 제거
                return null;
            }
        }) != null; // key-value 쌍이 제거 되었는지 여부 (연결 상태 정상, 내부 오류 X로 SSE 메시지 전송이 지속 가능한 상태인지)
    }

    public void sendJudgeJobError(JudgeJobError event) {
        String jobId = event.jobId();
        String error = event.error();

        // computeIfPresent를 사용하여 지정된 키(key)에 대해 필요한 로직과 함께 value를 원자적으로 업데이트.
        subscriptions.computeIfPresent(jobId, (key, emitter) -> {
            boolean success = this.sendSseMessage(emitter, "error " + error, null);
            if (success) emitter.complete();

            // 기존 key-value 쌍 제거
            return null;
        });
    }

    public void clearSubscription(String jobId, @Nullable Throwable error) {
        // computeIfPresent를 사용하여 지정된 키(key)에 대해 필요한 로직과 함께 value를 원자적으로 업데이트.
        subscriptions.computeIfPresent(jobId, (key, emitter) -> {
            if (error == null) {
                emitter.complete();
            } else {
                emitter.completeWithError(error);
            }

            // 기존 key-value 쌍 제거
            return null;
        });
    }

    // 전송 실패 시 false 반환
    private boolean sendSseMessage(
        SseEmitter emitter,
        String payload,
        @Nullable Integer eventId
    ) {
        // 클라이언트와의 연결이 성립되지 않은 상태에서 메시지는 내부 버퍼에 적재됨
        // 이후 실제 연결 성립 후 flush 처리됨
        try {
            if (eventId == null) {
                emitter.send(SseEmitter.event().data(payload));
            } else {
                emitter.send(SseEmitter.event()
                        .id(eventId.toString())
                        .data(payload)
                );
            }
            return true;
        } catch (IOException e) {
            // 사용자 이탈(React에서 직접 세션 close 또는 페이지 이탈)로 세션이 더이상 유효하지 않더라도
            // SseEmitter는 자체적으로 세션 상태를 감시하지 않기 때문에
            // IOException 발생 여부로 세션 상태(연결 끊김) 확인
            log.info("Disconnected with client - {}", e.getMessage());

            emitter.completeWithError(e);
            return false;
        }
    }

    /**
     * 명시적 SSE 자원 할당 해제 PreDestroy 메서드
     * 목적은 다음과 같음
     * 깔끔한 종료: 클라이언트에게 갑작스러운 연결 중단 대신 정상적인 스트림 종료 신호를 보낼 수 있음
     * 디버깅 지원: 로그를 통해 종료 시점에 활성 연결이 얼마나 있었는지 확인할 수 있어 문제 진단에 유용
     * 장애 내성: 일부 환경이나 프레임워크 버전에서는 명시적인 자원 정리가 필요한 경우가 있음
     */
    @PreDestroy
    public void shutdown() {
        log.info("Shutting down SSE service with {} active connections", subscriptions.size());

        // 현재 활성화된 jobId들의 스냅샷을 생성하여 동시 수정 문제 방지
        Set<String> jobIds = new HashSet<>(subscriptions.keySet());

        // 각 emitter를 원자적 연산을 사용하여 처리
        for (String jobId : jobIds) {
            subscriptions.computeIfPresent(jobId, (key, emitter) -> {
                try {
                    try {
                        emitter.send(SseEmitter.event().data("서버가 종료됩니다"));
                    } catch (IOException e) {
                        // 종료 중 전송 오류는 무시
                    }

                    // SseEmitter 완료 처리 (표준 메서드 사용)
                    emitter.complete();
                    log.info("Completed SSE emitter for job id: {} during shutdown", jobId);
                } catch (Exception e) {
                    log.warn("Error completing SSE emitter for job id {} during shutdown: {}", jobId, e.getMessage());
                }
                // null을 반환하여 맵에서 해당 항목 제거
                return null;
            });
        }

        // 남아있는 연결이 있는지 확인하고 필요한 경우 강제 정리
        int remaining = subscriptions.size();
        if (remaining > 0) {
            log.warn("{} SSE connections remained after shutdown attempt, forcing cleanup", remaining);
            subscriptions.clear();
        }

        log.info("SSE service shutdown completed");
    }
}
