#!/bin/bash
D="$(cd "$(dirname "$0")" && pwd)"
pkill -f "TotalprojectApplication|gradlew bootRun"; pkill -f "uvicorn main:app --host 127.0.0.1 --port 5050"; pkill -f "uvicorn main:app --host 127.0.0.1 --port 5051"; # Taskiq 워커는 종료 신호를 받아도 자식 프로세스가 남는 경우가 있어, 5초 뒤에도 살아 있으면 자식까지 강제 종료
W=$(pgrep -f "taskiq worker worker.broker:broker"); [ -n "$W" ] && { kill $W; sleep 5; for p in $W; do pkill -9 -P $p; done; kill -9 $W 2>/dev/null; }; pkill -f "vite --open false"
docker compose -f "$D/docker-compose.yml" stop
