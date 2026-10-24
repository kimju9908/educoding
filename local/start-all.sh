#!/bin/bash
# educoding 전체 로컬 실행. 로그: local/*.log
D="$(cd "$(dirname "$0")" && pwd)"; R="$D/.."
docker compose -f "$D/docker-compose.yml" up -d
echo "MySQL 준비 대기..."; until docker compose -f "$D/docker-compose.yml" exec -T mysql mysqladmin ping -uroot -peducoding --silent >/dev/null 2>&1; do sleep 2; done
nohup "$D/run-backend.sh" > "$D/backend.log" 2>&1 &
# 채점 API (FastAPI) / 채점 워커 (Taskiq)
(cd "$R/judge/api" && nohup ./venv/bin/uvicorn main:app --host 127.0.0.1 --port 5050 > "$D/judge-api.log" 2>&1 &)
(cd "$R/judge/worker" && nohup ./venv/bin/taskiq worker worker.broker:broker worker.tasks --workers 1 --max-async-tasks 4 > "$D/judge-worker.log" 2>&1 &)
# RAG 챗봇 서비스 (FastAPI) -- rag/.env에 ANTHROPIC_API_KEY를 채워야 답변이 동작함
(cd "$R/rag/service" && nohup ../.venv/bin/uvicorn main:app --host 127.0.0.1 --port 5051 > "$D/rag-service.log" 2>&1 &)
(cd "$R/frontend" && nohup yarn dev --open false > "$D/frontend.log" 2>&1 &)
echo "사이트 http://localhost:3000  | 메일함 http://localhost:8025  | 백엔드는 부팅에 ~20초"
