# ATHENA — API Specification (Low-Level Design)

## Base URL
- **Development:** `http://localhost:8000/api/v1`
- **Production:** `https://athena-api.modal.run/api/v1`

## Authentication
All endpoints (except auth routes) require a Bearer token in the Authorization header:
```
Authorization: Bearer <supabase_jwt_token>
```

Developer tier can also use API keys:
```
X-API-Key: athena_xxxxxxxxxxxxxxxx
```

## Common Response Format
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "request_id": "uuid",
    "timestamp": "2026-03-29T10:00:00Z"
  }
}
```

## Error Response Format
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error message",
    "details": { ... }
  },
  "meta": {
    "request_id": "uuid",
    "timestamp": "2026-03-29T10:00:00Z"
  }
}
```

## Rate Limits
| Tier | Requests/min | Agent Actions/mo | Documents |
|------|-------------|-----------------|-----------|
| Free | 30 | 500 | 5 |
| Pro | 120 | Unlimited | 50 |
| Ultra | 300 | Unlimited | Unlimited |
| Developer | 600 | Usage-based | Usage-based |

Rate limit headers included in every response:
```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 28
X-RateLimit-Reset: 1711700000
```

---

## 1. Auth Endpoints

### POST /api/v1/auth/signup
Create a new account (creates tenant + profile).
```json
// Request
{
  "email": "user@example.com",
  "password": "securepassword123",
  "display_name": "ATHENA Team"
}

// Response 201
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "tenant_id": "uuid",
    "access_token": "jwt...",
    "refresh_token": "jwt..."
  }
}
```

### POST /api/v1/auth/login
```json
// Request
{
  "email": "user@example.com",
  "password": "securepassword123"
}

// Response 200
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "tenant_id": "uuid",
    "access_token": "jwt...",
    "refresh_token": "jwt..."
  }
}
```

### POST /api/v1/auth/refresh
```json
// Request
{ "refresh_token": "jwt..." }

// Response 200
{
  "success": true,
  "data": {
    "access_token": "new_jwt...",
    "refresh_token": "new_jwt..."
  }
}
```

### POST /api/v1/auth/google
Google OAuth callback handler.

---

## 2. User Endpoints

### GET /api/v1/users/me
Get current user profile.
```json
// Response 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "tenant_id": "uuid",
    "email": "user@example.com",
    "display_name": "ATHENA Team",
    "avatar_url": "https://...",
    "preferences": {
      "timezone": "Asia/Kolkata",
      "language": "en",
      "theme": "dark",
      "voice_id": "alloy"
    },
    "plan": "free",
    "onboarding_completed": false
  }
}
```

### PATCH /api/v1/users/me
Update profile or preferences.
```json
// Request
{
  "display_name": "Author",
  "preferences": { "timezone": "Asia/Kolkata", "theme": "dark" }
}

// Response 200 — updated profile
```

### POST /api/v1/users/me/onboarding
Complete onboarding.
```json
// Request
{
  "display_name": "Author",
  "timezone": "Asia/Kolkata",
  "interests": ["coding", "finance", "health"]
}

// Response 200
```

---

## 3. Conversation Endpoints

### POST /api/v1/conversations
Create a new conversation.
```json
// Request
{ "title": "Help me plan my week" }

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Help me plan my week",
    "agent_type": "supervisor",
    "created_at": "2026-03-29T10:00:00Z"
  }
}
```

### GET /api/v1/conversations
List conversations (paginated, sorted by updated_at DESC).
```
Query params: ?limit=20&offset=0&search=keyword
```

### GET /api/v1/conversations/{id}
Get conversation with messages.
```json
// Response 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Help me plan my week",
    "messages": [
      {
        "id": "uuid",
        "role": "user",
        "content": "What should I focus on this week?",
        "created_at": "2026-03-29T10:00:00Z"
      },
      {
        "id": "uuid",
        "role": "assistant",
        "content": "Based on your goals...",
        "agent_name": "life_coach",
        "tokens_used": 450,
        "created_at": "2026-03-29T10:00:01Z"
      }
    ]
  }
}
```

### POST /api/v1/conversations/{id}/messages
Send a message and receive streamed response.
```json
// Request
{
  "content": "Research the best noise-cancelling headphones under $200",
  "attachments": []  // optional document IDs
}

// Response: SSE stream (text/event-stream)
data: {"type": "agent_start", "agent": "supervisor", "message": "Routing to researcher..."}
data: {"type": "agent_start", "agent": "researcher", "message": "Searching the web..."}
data: {"type": "tool_call", "agent": "researcher", "tool": "web_search", "input": {"query": "best noise cancelling headphones under 200 2026"}}
data: {"type": "token", "content": "Based on my research"}
data: {"type": "token", "content": ", here are the top 3"}
data: {"type": "memory_used", "memories": [{"id": "uuid", "content": "User prefers Sony brand"}]}
data: {"type": "agent_end", "agent": "researcher", "tokens": 850}
data: {"type": "done", "message_id": "uuid", "total_tokens": 1200}
```

### DELETE /api/v1/conversations/{id}
Delete a conversation and all its messages.

---

## 4. Voice Endpoints

### WebSocket /api/v1/voice/session
Real-time voice conversation via WebSocket.
```
// Client → Server
{ "type": "audio_chunk", "data": "<base64 audio>" }
{ "type": "config", "voice": "alloy", "language": "en" }
{ "type": "interrupt" }
{ "type": "end" }

// Server → Client
{ "type": "transcript", "text": "What's on my calendar?", "final": true }
{ "type": "audio_chunk", "data": "<base64 audio>" }
{ "type": "agent_action", "agent": "scheduler", "tool": "google_calendar" }
{ "type": "function_result", "result": { ... } }
{ "type": "session_end", "duration_ms": 45000 }
```

### POST /api/v1/voice/transcribe
Upload audio file for transcription.
```
Content-Type: multipart/form-data
file: audio.webm

// Response 200
{ "success": true, "data": { "text": "Transcribed text here" } }
```

### GET /api/v1/voice/sessions
List past voice sessions with transcripts.

---

## 5. Memory Endpoints

### GET /api/v1/memories
List user's memories (paginated, filterable).
```
Query params: ?type=fact&limit=50&offset=0&search=keyword
```

### POST /api/v1/memories
Manually add a memory.
```json
// Request
{
  "content": "I prefer window seats on flights",
  "memory_type": "preference"
}
```

### POST /api/v1/memories/search
Semantic search across memories.
```json
// Request
{ "query": "flight preferences", "limit": 10 }

// Response 200
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "content": "I prefer window seats on flights",
      "memory_type": "preference",
      "importance": 0.8,
      "similarity": 0.92,
      "created_at": "2026-03-20T10:00:00Z"
    }
  ]
}
```

### DELETE /api/v1/memories/{id}
Delete a specific memory. User controls their data.

---

## 6. Document Endpoints

### POST /api/v1/documents/upload
Upload a document for RAG processing.
```
Content-Type: multipart/form-data
file: document.pdf

// Response 202 (Accepted — processing async)
{
  "success": true,
  "data": {
    "id": "uuid",
    "filename": "document.pdf",
    "status": "processing",
    "mime_type": "application/pdf"
  }
}
```

### GET /api/v1/documents
List uploaded documents.

### GET /api/v1/documents/{id}/status
Check processing status.
```json
// Response 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "ready",
    "chunk_count": 42,
    "processed_at": "2026-03-29T10:05:00Z"
  }
}
```

### POST /api/v1/documents/query
RAG query across all user's documents.
```json
// Request
{ "query": "What are the key findings?", "document_ids": ["uuid"] }

// Response 200
{
  "success": true,
  "data": {
    "answer": "The key findings are...",
    "sources": [
      { "document_id": "uuid", "chunk_index": 3, "content": "...", "relevance": 0.94 }
    ]
  }
}
```

### DELETE /api/v1/documents/{id}
Delete document + all chunks.

---

## 7. Task Endpoints

### POST /api/v1/tasks
Create a background task.
```json
// Request
{
  "title": "Check Amazon prices for headphones",
  "agent_type": "browser",
  "scheduled_at": null  // null = immediate
}
```

### GET /api/v1/tasks
List tasks (filterable by status, agent, priority).

### GET /api/v1/tasks/{id}
Get task details including result.

### PATCH /api/v1/tasks/{id}/cancel
Cancel a running task.

### SSE /api/v1/tasks/{id}/progress
Stream task progress updates.
```
data: {"type": "step", "message": "Opening browser...", "progress": 10}
data: {"type": "screenshot", "url": "https://r2.../screenshot_001.png"}
data: {"type": "step", "message": "Searching for headphones...", "progress": 40}
data: {"type": "complete", "result": { ... }, "progress": 100}
```

---

## 8. Browser Endpoints

### POST /api/v1/browser/execute
Execute a browser automation task.
```json
// Request
{
  "instruction": "Go to amazon.in and find the cheapest wireless mouse with 4+ stars",
  "max_steps": 20,
  "timeout_seconds": 300
}

// Response 202
{
  "success": true,
  "data": {
    "session_id": "uuid",
    "task_id": "uuid",
    "status": "active"
  }
}
```

### GET /api/v1/browser/sessions
List browser sessions.

### GET /api/v1/browser/sessions/{id}
Get session details with action log and screenshots.

### GET /api/v1/browser/sessions/{id}/screenshot
Get latest screenshot.

---

## 9. Life OS Endpoints

### Habits
```
POST   /api/v1/life/habits              — Create habit
GET    /api/v1/life/habits              — List habits
PATCH  /api/v1/life/habits/{id}         — Update habit
DELETE /api/v1/life/habits/{id}         — Delete habit
POST   /api/v1/life/habits/{id}/log     — Log completion
GET    /api/v1/life/habits/{id}/logs    — Get habit logs
```

### Goals
```
POST   /api/v1/life/goals               — Create goal
GET    /api/v1/life/goals               — List goals
PATCH  /api/v1/life/goals/{id}          — Update goal
PATCH  /api/v1/life/goals/{id}/progress — Update progress
DELETE /api/v1/life/goals/{id}          — Delete goal
```

### Finance
```
POST   /api/v1/life/finance              — Add entry
GET    /api/v1/life/finance              — List entries (filterable by date, category, type)
PATCH  /api/v1/life/finance/{id}         — Update entry
DELETE /api/v1/life/finance/{id}         — Delete entry
GET    /api/v1/life/finance/summary      — Get summary (monthly/weekly breakdown)
```

### Health
```
POST   /api/v1/life/health               — Log metric
GET    /api/v1/life/health               — List logs (filterable by metric_type, date range)
GET    /api/v1/life/health/trends        — Get trend data for charts
```

### Reports
```
GET    /api/v1/life/reports/weekly        — Get latest weekly report
GET    /api/v1/life/reports/weekly/{date} — Get report for specific week
GET    /api/v1/life/reports/insights      — Get AI-generated insights
POST   /api/v1/life/nudges/acknowledge   — Mark nudge as seen
```

---

## 10. Analytics Endpoints

### GET /api/v1/analytics/usage
Token usage and API call statistics.
```json
// Response 200
{
  "success": true,
  "data": {
    "period": "2026-03",
    "total_tokens": 125000,
    "total_cost_usd": 2.45,
    "by_agent": {
      "researcher": { "tokens": 45000, "calls": 23 },
      "scheduler": { "tokens": 12000, "calls": 45 }
    },
    "by_model": {
      "gpt-4o": { "tokens": 80000, "cost": 1.60 },
      "gpt-4o-mini": { "tokens": 45000, "cost": 0.85 }
    }
  }
}
```

### GET /api/v1/analytics/agents
Agent performance metrics.

---

## 11. Admin Endpoints

### POST /api/v1/admin/api-keys
Create an API key (developer tier only).
```json
// Request
{
  "name": "My App",
  "scopes": ["conversations:read", "conversations:write", "memories:read"]
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "key": "athena_xxxxxxxxxxxxxxxxxxxx",  // ONLY shown once
    "key_prefix": "athena_xx",
    "name": "My App",
    "scopes": ["conversations:read", "conversations:write", "memories:read"]
  }
}
```

### GET /api/v1/admin/api-keys
List API keys (shows prefix only, never full key).

### DELETE /api/v1/admin/api-keys/{id}
Revoke an API key.

### GET /api/v1/admin/audit-log
Query audit log (paginated, filterable by action, resource_type, date range).

---

## Backend Module Structure

```
backend/
├── app/
│   ├── main.py                    # FastAPI app + middleware
│   ├── core/
│   │   ├── config.py              # Pydantic Settings (env vars)
│   │   ├── security.py            # JWT validation, tenant resolution
│   │   ├── middleware.py          # Rate limiter, audit logger, CORS
│   │   ├── dependencies.py       # DI (db, redis, neo4j clients)
│   │   └── exceptions.py         # Custom exception handlers
│   ├── routers/
│   │   ├── auth.py               # Auth endpoints
│   │   ├── users.py              # User profile endpoints
│   │   ├── conversations.py      # Conversation + message endpoints
│   │   ├── voice.py              # Voice WebSocket + endpoints
│   │   ├── memories.py           # Memory CRUD + search
│   │   ├── documents.py          # Document upload + RAG query
│   │   ├── tasks.py              # Task management
│   │   ├── browser.py            # Browser automation
│   │   ├── life.py               # Life OS (habits, goals, finance, health)
│   │   ├── analytics.py          # Usage + agent metrics
│   │   └── admin.py              # API keys + audit log
│   ├── services/
│   │   ├── agent_service.py      # Agent orchestration service
│   │   ├── memory_service.py     # Memory extraction + retrieval
│   │   ├── document_service.py   # Document processing pipeline
│   │   ├── voice_service.py      # Voice session management
│   │   ├── browser_service.py    # Playwright automation
│   │   ├── life_service.py       # Life OS business logic
│   │   ├── analytics_service.py  # Metrics aggregation
│   │   └── knowledge_service.py  # Neo4j graph operations
│   ├── agents/
│   │   ├── supervisor.py         # LangGraph supervisor graph
│   │   ├── intent_classifier.py  # Semantic intent routing
│   │   ├── researcher.py         # Researcher agent + tools
│   │   ├── scheduler.py          # Scheduler agent + tools
│   │   ├── life_coach.py         # Life Coach agent + tools
│   │   ├── coder.py              # Coder agent + tools
│   │   ├── browser_agent.py      # Browser agent + tools
│   │   ├── finance_agent.py      # Finance agent + tools
│   │   └── tools/                # Shared tool implementations
│   │       ├── web_search.py
│   │       ├── calendar.py
│   │       ├── email.py
│   │       ├── playwright_tools.py
│   │       └── life_tools.py
│   ├── models/
│   │   ├── auth.py               # Auth request/response models
│   │   ├── conversation.py       # Conversation models
│   │   ├── memory.py             # Memory models
│   │   ├── document.py           # Document models
│   │   ├── task.py               # Task models
│   │   ├── life.py               # Life OS models
│   │   └── common.py             # Shared models (pagination, response wrapper)
│   └── workers/
│       ├── document_worker.py    # Celery: document processing
│       ├── report_worker.py      # Celery: weekly report generation
│       └── proactive_worker.py   # Celery: proactive checks + nudges
├── sql/
│   ├── 001_tenants_profiles.sql
│   ├── 002_conversations_messages.sql
│   ├── 003_memory_documents.sql
│   ├── 004_tasks_browser.sql
│   ├── 005_life_os.sql
│   └── 006_security_audit.sql
├── tests/
├── requirements.txt
└── modal_app.py                  # Modal deployment config
```
