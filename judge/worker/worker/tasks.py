import logging

from config import TaskQueueConfig
from redisutil.repository import job_repository
from schema.job import CodeChallengeJudgmentJob as Job
from schema.webhook_event import Error
from worker.broker import broker
from worker.helpers import async_execute_code
from worker.webhook_manager import AsyncWebhookManager

"""
채점 작업 (Taskiq). Celery 시절에는 동기 작업 안에서 이벤트 루프를 직접 만들어
비동기 채점 코드를 돌렸지만, Taskiq는 작업 자체가 async라 그대로 await 한다.

실행: ./venv/bin/taskiq worker worker.broker:broker worker.tasks --max-async-tasks 4
"""


@broker.task(task_name=TaskQueueConfig.EXECUTE_CODE_TASK)
async def execute_code(user_id: int, job_dict: dict) -> None:
    # 여기서 실패(잘못된 작업 데이터 등)하면 예외를 그대로 던져 재시도 미들웨어가 다시 시도하게 함
    job = Job.create_from_dict(job_dict)

    webhook_manager = AsyncWebhookManager()
    await webhook_manager.initialize()
    try:
        # 채점 본체 — 끝나면 내부 finally에서 webhook_manager 세션을 닫는다
        await async_execute_code(user_id, job, webhook_manager)
    except Exception:
        # 채점 도중 처리되지 않은 예외: 같은 작업을 다시 돌리지 않고(사용자 코드가 원인일 수 있으므로)
        # 작업을 정리한 뒤 Spring에 오류를 알린다.
        logging.error(f"작업 실행 중 처리되지 않은 예외 발생\n작업 정보: {job_dict}", exc_info=True)
        job_repository.delete(job.job_id, user_id)
        await _notify_error(job.job_id)


async def _notify_error(job_id: str) -> None:
    # 채점 쪽 세션은 이미 닫혔을 수 있으므로 오류 알림은 새 세션으로 보낸다
    # (Celery 버전은 닫힌 세션으로 보내려다 실패해서 오류 알림이 전달되지 않았음)
    notifier = AsyncWebhookManager()
    await notifier.initialize()
    try:
        await notifier.dispatch_webhook_callback(Error(job_id))
    finally:
        await notifier.shutdown()
