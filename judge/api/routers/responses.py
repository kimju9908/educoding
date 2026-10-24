from typing import Optional

from fastapi.responses import JSONResponse

# Spring 쪽(CodeChallengeJudgeJobService)이 기대하는 응답 모양
#  성공: { ...데이터 }      실패: { "error": "메시지" }


def error_response(message: str, http_status: int = 500) -> JSONResponse:
    return JSONResponse({"error": message}, status_code=http_status)


def success_response(data: Optional[dict] = None, http_status: int = 200) -> JSONResponse:
    return JSONResponse(dict(data or {}), status_code=http_status)
