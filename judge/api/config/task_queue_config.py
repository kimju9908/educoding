class TaskQueueConfig:
    """
    Description:
        Taskiq 작업 큐 설정. API(작업을 넣는 쪽)와 worker(꺼내서 실행하는 쪽)가
        반드시 같은 값을 써야 하므로 worker/config/task_queue_config.py 와 내용을 동일하게 유지한다.
    """
    # Redis 리스트 이름 (Celery의 기본 큐 "celery" 대신 전용 이름 사용)
    QUEUE_NAME = "educoding-judge"

    # 워커에 등록된 채점 작업 이름 — API는 워커 코드를 import하지 않고 이 이름으로 작업을 보낸다
    EXECUTE_CODE_TASK = "judge.execute_code"
