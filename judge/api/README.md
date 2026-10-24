<h2>Overview</h2>

A Flask-based REST API server that orchestrates distributed code grading tasks. Handles code submission requests, manages task queues via Redis, and delivers real-time grading results through webhook callbacks.
<br />
<br />





<h2>Architecture</h2>

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌────────────┐
│   Client    │────>│  Spring Boot │────>│  Flask API   │────>│   Redis    │
│  (Browser)  │     │   Backend    │     │   Server     │     │  (Broker)  │
└─────────────┘     └──────────────┘     └──────────────┘     └────────────┘
                           ▲                                        │
                           │                                        ▼
                    (Webhook SSE)                            ┌────────────┐
                           │                                 │   Celery   │
                           └─────────────────────────────────│   Worker   │
                                                             └────────────┘
```
<br />





<h2>Features</h2>

- **Task Queue Management**: Redis-based task queue for distributed job processing
- **Multi-language Support**: Java 17, C11, C++17, Node.js 20, Python 3
- **API Key Authentication**: HMAC-SHA256 based secure server-to-server communication
- **Async Result Delivery**: Webhook callback mechanism for real-time grading feedback
- **Job Lifecycle Management**: Create, execute, cancel, and track grading jobs
<br />





## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Flask |
| Task Queue | Celery |
| Message Broker | Redis |
| Authentication | HMAC-SHA256 |
| Container | Docker |
<br />





## API Endpoints




### Job Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/jobs` | Create a new grading job |
| POST | `/api/v1/jobs/{job_id}/execute` | Execute a grading job |
| DELETE | `/api/v1/jobs/{job_id}` | Cancel a running job |
| GET | `/api/v1/jobs/{job_id}/status` | Get job status |
<br />





### Request Example

```json
POST /api/v1/jobs
{
  "language": "java",
  "code": "public class Main { ... }",
  "testcases": [
    { "input": "5\n3", "expected": "8" }
  ],
  "timeLimit": 2000,
  "memoryLimit": 256
}
```
<br />





### Response Example

```json
{
  "jobId": "abc123",
  "status": "QUEUED",
  "createdAt": "2025-01-15T10:30:00Z"
}
```
<br />





## Authentication

All requests require HMAC-SHA256 signature in the `X-Api-Signature` header:

```python
signature = hmac.new(
    api_secret.encode(),
    request_body.encode(),
    hashlib.sha256
).hexdigest()
```
<br />





## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `REDIS_URL` | Redis connection URL | Yes |
| `API_SECRET` | HMAC secret key | Yes |
| `WEBHOOK_URL` | Callback URL for results | Yes |
| `ALLOWED_IPS` | Whitelist IP addresses | Yes |
<br />





## License

MIT
