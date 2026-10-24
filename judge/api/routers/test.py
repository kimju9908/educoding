import logging

from fastapi import APIRouter, Request, Response

# 개발용: Spring 없이 워커를 시험할 때 웹훅을 대신 받아 로그로 찍어 보는 엔드포인트
router = APIRouter(prefix="/test", tags=["test"])


async def _log_and_ok(request: Request) -> Response:
    logging.info("[test webhook] %s %s", request.url.path, await request.json())
    return Response(status_code=200)


for _path in ("/test-case-result", "/judgment-passed", "/judgment-unpassed", "/error"):
    router.add_api_route(_path, _log_and_ok, methods=["POST"])
