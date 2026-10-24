import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

import config  # noqa: F401  (.env 로드)
from routers import job_router, test_router
from routers.responses import error_response
from security.hmac_auth import validate_hmac_key
from task_queue import broker

logging.basicConfig(level=logging.INFO)

"""
채점 API 서버 (FastAPI) — 예전 Flask app.py 대체.
실행: ./venv/bin/uvicorn main:app --host 127.0.0.1 --port 5050
"""


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Taskiq 브로커(Redis 연결) 준비/정리
    await broker.startup()
    yield
    await broker.shutdown()


app = FastAPI(title="educoding judge API", version="2.0.0", lifespan=lifespan)


# ── 인증: /job/** 는 Spring만 호출 가능 (X-Api-Key = HMAC-SHA256(secret, X-Client-Id))
#    본문 검증보다 먼저 확인해야 하므로(Flask의 before_request와 동일) 미들웨어로 처리
@app.middleware("http")
async def verify_api_key(request: Request, call_next):
    if request.url.path == "/job" or request.url.path.startswith("/job/"):
        api_key = request.headers.get("X-Api-Key")
        client_id = request.headers.get("X-Client-Id")
        if not (api_key and client_id) or not validate_hmac_key(api_key, client_id):
            return error_response("Access denied", 403)
    return await call_next(request)


# ── 에러 응답을 예전과 같은 { "error": ... } 모양으로
_BODY_ERROR_MESSAGES = {
    "/job/create": "Request body must contain valid 'userId'(integer), 'challengeId'(integer), 'code' and 'codeLanguage'",
}
_DEFAULT_BODY_ERROR = "Request body must contain 'userId'(integer) and 'jobId'"


@app.exception_handler(RequestValidationError)
async def handle_validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
    if any(error.get("type") == "json_invalid" for error in exc.errors()):
        return error_response("Request must be in JSON format", 400)
    return error_response(_BODY_ERROR_MESSAGES.get(request.url.path, _DEFAULT_BODY_ERROR), 400)


@app.exception_handler(StarletteHTTPException)
async def handle_http_error(_: Request, exc: StarletteHTTPException) -> JSONResponse:
    return error_response(str(exc.detail), exc.status_code)


@app.exception_handler(Exception)
async def handle_unexpected_error(_: Request, exc: Exception) -> JSONResponse:
    logging.error("[Unexpected exception occurred]", exc_info=exc)
    return error_response("Internal server error", 500)


app.include_router(job_router)
app.include_router(test_router)


@app.get("/health", include_in_schema=False)
async def health() -> dict:
    return {"status": "ok"}
