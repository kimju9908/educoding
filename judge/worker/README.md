<h2>Overview</h2>

A Celery-based distributed worker that executes user-submitted code in isolated Docker containers. Implements multi-layer security policies to prevent malicious code execution while providing accurate performance metrics.
<br />
<br />




<h2>Architecture</h2>

```
┌─────────────┐
│   Redis     │
│  (Broker)   │
└──────┬──────┘
       │ Task Pull
       ▼
┌───────────────────────────────────────────────────────┐
│                    Celery Worker                      │
│  ┌─────────────────────────────────────────────────┐  │
│  │              Worker Process (prefork)           │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐          │  │
│  │  │  Task 1 │  │  Task 2 │  │  Task N │          │  │
│  │  └────┬────┘  └────┬────┘  └────┬────┘          │  │
│  └───────┼────────────┼────────────┼───────────────┘  │
│          ▼            ▼            ▼                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │  Docker     │ │  Docker     │ │  Docker     │      │
│  │  Sandbox    │ │  Sandbox    │ │  Sandbox    │      │
│  └─────────────┘ └─────────────┘ └─────────────┘      │
└───────────────────────────────────────────────────────┘
       │
       ▼ Webhook Callback
┌─────────────┐
│ Spring Boot │
│   Backend   │
└─────────────┘
```
<br />





<h2>Features</h2>

- **Secure Sandboxing**: Docker container isolation with seccomp syscall filtering
- **Multi-language Support**: Java 17, C11, C++17, Node.js 20, Python 3
- **Resource Limits**: Memory, CPU, process count, and execution time controls
- **Real-time Feedback**: Detailed error messages (CE/RE/TLE/MLE)
- **Horizontal Scaling**: Add workers dynamically via Celery
<br />





<h2>Tech Stack</h2>

- **Task Queue**: Celery + Redis (Broker)
- **Container**: Docker
- **Grading Script**: Bash
<br />





<h2>Quick Start</h2>

```bash
celery -A worker.celery_app worker --loglevel=info --concurrency=4
```
<br />



