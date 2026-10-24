import base64
import binascii
import logging

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field, field_validator
from starlette.concurrency import run_in_threadpool

from common import CodeLanguage
from config import JobConfig, TestCaseConfig
from redisutil.repository import job_repository
from routers.responses import error_response, success_response
from schema.job import CodeChallengeJudgmentJob as Job
from task_queue import send_execute_code_task

# Spring(CodeChallengeJudgeJobService)이 호출하는 채점 작업 API.
# 경로·요청 필드·응답 모양·상태 코드는 Flask 시절과 동일하게 유지한다.
# (Redis 저장소는 동기 클라이언트라 run_in_threadpool로 이벤트 루프를 막지 않게 호출)
router = APIRouter(prefix="/job", tags=["job"])

MAX_CODE_BYTES = 1 * 1024 * 1024  # 1MB


class _CamelModel(BaseModel):
    # JSON은 camelCase(userId), 파이썬 안에서는 snake_case(user_id)
    model_config = ConfigDict(populate_by_name=True)


class CreateJobRequest(_CamelModel):
    user_id: int = Field(alias="userId")
    challenge_id: int = Field(alias="challengeId")
    code: str
    code_language: str = Field(alias="codeLanguage")

    @field_validator("code_language")
    @classmethod
    def check_language(cls, value: str) -> str:
        if value.upper() not in [language.value for language in CodeLanguage]:
            raise ValueError("unsupported codeLanguage")
        return value.upper()


class JobIdRequest(_CamelModel):
    user_id: int = Field(alias="userId")
    job_id: str = Field(alias="jobId")


# 1) /job/create — 작업 생성 (아직 실행하지 않음)
@router.post("/create")
async def create_job(request: CreateJobRequest) -> JSONResponse:
    try:
        test_cases = TestCaseConfig.get_test_cases(request.challenge_id)
    except KeyError:
        test_cases = None
    if not test_cases:
        return error_response(
            f"No test cases found for the provided 'challengeId'={request.challenge_id}", 404
        )

    # 제출된 코드 유효성(크기 및 형식) 검사
    try:
        # validate=True: base64에 쓸 수 없는 문자가 섞여 있으면 예외
        decoded_bytes = base64.b64decode(request.code, validate=True)
    except binascii.Error:
        return error_response("'code' field is not in a valid format", 400)
    if len(decoded_bytes) > MAX_CODE_BYTES:
        return error_response("Source code size exceeds 1MB", 400)
    try:
        code_str = decoded_bytes.decode("utf-8")
    except UnicodeDecodeError:
        return error_response("'code' field is not in a valid format", 400)
    if not code_str.strip():
        return error_response("Empty source file", 400)

    # 유저당 동시에 유지할 수 있는 채점 작업 수 제한
    user_active_jobs = await run_in_threadpool(job_repository.find_by_user_id, request.user_id)
    if len(user_active_jobs) >= JobConfig.MAX_JOB_COUNT_PER_USER:
        return error_response(
            f"Max job count={JobConfig.MAX_JOB_COUNT_PER_USER} exceeded for userId:{request.user_id}",
            422,
        )

    code_language = CodeLanguage[request.code_language]
    job = Job.create(
        code_language=code_language,
        code=request.code,
        challenge_id=request.challenge_id,
        total_test_cases=len(test_cases),
    )

    # 작업 TTL: 테스트 케이스별 시간 제한 × 케이스 수 × 2 (정수만 허용되므로 반올림)
    test_case_time_limit = TestCaseConfig.get_time_limit(request.challenge_id, job.code_language)
    job_ttl = round(test_case_time_limit * len(test_cases) * 2)

    if await run_in_threadpool(job_repository.save, request.user_id, job, job_ttl) == 0:
        logging.error('[Handling "/job/create" request failed. No exception but job doesn\'t saved]')
        return error_response("Internal server error", 500)

    return success_response({"jobId": f"{job.job_id}"}, 201)


# 2) /job/execute — 작업을 Taskiq 큐에 넣고 바로 응답 (채점 결과는 워커가 웹훅으로 전달)
@router.post("/execute")
async def execute_job(request: JobIdRequest) -> JSONResponse:
    job: Job = await run_in_threadpool(
        job_repository.find_by_user_id_and_job_id, request.user_id, request.job_id
    )
    if not job:
        return error_response(
            f"Job not found for user_id={request.user_id} with job_id={request.job_id}", 404
        )

    # 매개변수는 JSON으로 직렬화되므로 파이썬 기본 타입(dict)으로 전달
    await send_execute_code_task(request.user_id, job.as_dict())
    return success_response({"totalTestCases": job.total_test_cases}, 202)


# 3) /job/cancel — 실행 중인 작업에 중단 표시
@router.post("/cancel")
async def cancel_job(request: JobIdRequest) -> JSONResponse:
    update_res = await run_in_threadpool(
        job_repository.update, job_id=request.job_id, user_id=request.user_id, stop_flag=True
    )
    if update_res == -1:
        return error_response(
            f"Job not found for user_id={request.user_id} with job_id={request.job_id}", 404
        )
    if update_res == 0:
        logging.error('[Handling "/job/cancel" request failed. No exception but job doesn\'t updated]')
        return error_response("Internal server error", 500)
    return success_response(http_status=202)


# 4) /job — 작업 존재 여부 확인
@router.post("")
async def check_job_exists(request: JobIdRequest) -> JSONResponse:
    job: Job = await run_in_threadpool(
        job_repository.find_by_user_id_and_job_id, request.user_id, request.job_id
    )
    if not job:
        return error_response(
            f"Job not found for user_id={request.user_id} with job_id={request.job_id}", 404
        )
    return success_response(http_status=200)
