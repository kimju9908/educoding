from taskiq import SmartRetryMiddleware
from taskiq_redis import ListQueueBroker

from config import RedisConfig, TaskQueueConfig

# 채점 워커의 Taskiq 브로커 (예전 celery_app 대체).
# API가 같은 Redis 리스트(QUEUE_NAME)에 넣은 작업을 꺼내 실행한다.
broker = ListQueueBroker(
    url=RedisConfig.REDIS_URI,
    queue_name=TaskQueueConfig.QUEUE_NAME,
    # 워커는 BRPOP으로 새 작업이 올 때까지 계속 기다린다. redis-py 8의 기본 소켓 읽기 제한(5초)이
    # 걸려 있으면 큐가 비어 있을 때 5초마다 TimeoutError가 나고, taskiq-redis가 이를 처리하지 못해
    # 워커 프로세스가 죽고 재시작되기를 반복한다 → 읽기 제한을 끄고 keepalive로 죽은 연결만 감지
    socket_timeout=None,
    socket_keepalive=True,
).with_middlewares(
    # Celery 시절 설정(autoretry_for=Exception, retry_backoff, max_retries=3)과 같게:
    # 작업이 예외로 끝나면 1초 → 2초 → 4초 간격으로 최대 3번 다시 시도
    # (default_retry_count는 "총 시도 횟수"라 첫 실행 1 + 재시도 3 = 4)
    SmartRetryMiddleware(
        default_retry_count=4,
        default_retry_label=True,
        default_delay=1,
        use_delay_exponent=True,
        max_delay_exponent=60,
        use_jitter=True,
    ),
)
