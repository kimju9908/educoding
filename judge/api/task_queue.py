from taskiq.kicker import AsyncKicker
from taskiq_redis import ListQueueBroker

from config import RedisConfig, TaskQueueConfig

# 작업을 "보내기만" 하는 Taskiq 브로커 (예전 Celery("task-sender") 클라이언트 역할).
# 결과는 웹훅으로 Spring에 직접 전달되므로 결과 저장소(result backend)는 쓰지 않는다.
broker = ListQueueBroker(
    url=RedisConfig.REDIS_URI,
    queue_name=TaskQueueConfig.QUEUE_NAME,
)


async def send_execute_code_task(user_id: int, job_dict: dict) -> None:
    """
    채점 작업을 큐에 넣는다. API는 worker 코드를 import하지 않고 작업 이름으로만 보낸다
    (예전 celery_client.send_task('worker.tasks.execute_code', ...) 와 같은 방식).
    """
    await AsyncKicker(
        task_name=TaskQueueConfig.EXECUTE_CODE_TASK,
        broker=broker,
        labels={},
    ).kiq(user_id, job_dict)
