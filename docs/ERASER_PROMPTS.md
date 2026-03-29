# ATHENA — Eraser Diagram Prompts

Use these prompts at [eraser.io](https://eraser.io) to generate architecture diagrams.

---

## 1. System Architecture (High-Level)

```
// ATHENA System Architecture
Vercel [icon: vercel, color: black] {
  Next.js 15 Frontend [icon: nextjs]
  Dashboard [icon: layout]
  Chat UI [icon: message-circle]
  Voice UI [icon: mic]
  Life OS [icon: heart]
}

Modal [icon: cloud, color: green] {
  FastAPI Backend [icon: server]
  Agent Engine [icon: brain]
  Browser Engine [icon: chrome]
  Celery Workers [icon: settings]
}

Supabase [icon: database, color: green] {
  PostgreSQL [icon: database]
  pgvector [icon: search]
  Auth [icon: lock]
  RLS [icon: shield]
}

Redis [icon: zap, color: red] {
  Cache [icon: hard-drive]
  Rate Limiter [icon: clock]
  Job Queue [icon: list]
}

Neo4j [icon: share-2, color: blue] {
  Knowledge Graph [icon: git-branch]
}

R2 [icon: cloud, color: orange] {
  Files [icon: file]
  Screenshots [icon: image]
}

Vercel > Modal: HTTPS / WSS
Modal > Supabase: SQL + pgvector
Modal > Redis: Cache + Queue
Modal > Neo4j: Cypher queries
Modal > R2: File storage
```

---

## 2. Agent Orchestration Flow

```
// ATHENA Agent Orchestration
User Message [icon: user] > Intent Classifier [icon: cpu]
Intent Classifier > Supervisor [icon: brain]

Supervisor > Researcher [icon: search] {
  Web Search [icon: globe]
  RAG Query [icon: database]
  Doc Analyzer [icon: file-text]
}

Supervisor > Scheduler [icon: calendar] {
  Google Calendar [icon: calendar]
  Email Draft [icon: mail]
  Reminders [icon: bell]
}

Supervisor > Life Coach [icon: heart] {
  Habits [icon: check-circle]
  Goals [icon: target]
  Health [icon: activity]
  Reports [icon: bar-chart]
}

Supervisor > Coder [icon: code] {
  Code Executor [icon: terminal]
  GitHub API [icon: github]
  Code Review [icon: eye]
}

Supervisor > Browser Agent [icon: chrome] {
  Playwright [icon: monitor]
  Screenshots [icon: camera]
  Data Extract [icon: download]
}

Supervisor > Finance [icon: dollar-sign] {
  Expenses [icon: credit-card]
  Budget [icon: pie-chart]
  Analysis [icon: trending-up]
}

Researcher > Supervisor: Results
Scheduler > Supervisor: Results
Life Coach > Supervisor: Results
Coder > Supervisor: Results
Browser Agent > Supervisor: Results
Finance > Supervisor: Results

Supervisor > Response Synthesizer [icon: edit]
Response Synthesizer > User Response [icon: message-circle]
Response Synthesizer > Memory Extractor [icon: save]
```

---

## 3. Data Flow — Chat Message

```
// Chat Message Flow
User [icon: user] > Next.js BFF [icon: nextjs]: Send message
Next.js BFF > FastAPI [icon: server]: POST /conversations/{id}/messages
FastAPI > Auth Middleware [icon: shield]: Validate JWT
Auth Middleware > Rate Limiter [icon: clock]: Check limits
Rate Limiter > Tenant Resolver [icon: users]: Resolve tenant
Tenant Resolver > Memory Service [icon: brain]: Fetch relevant memories
Memory Service > pgvector [icon: search]: Semantic search
Tenant Resolver > Intent Classifier [icon: cpu]: Classify intent
Intent Classifier > LangGraph Supervisor [icon: git-branch]: Route to agents
LangGraph Supervisor > Agent(s) [icon: bot]: Execute with tools
Agent(s) > Tool APIs [icon: globe]: Web search, calendar, etc.
Agent(s) > LangGraph Supervisor: Return results
LangGraph Supervisor > SSE Stream [icon: radio]: Stream tokens
SSE Stream > Next.js BFF: Server-sent events
Next.js BFF > User: Streaming response
FastAPI > Memory Extractor [icon: save]: Extract facts (async)
Memory Extractor > Supabase [icon: database]: Store memories
FastAPI > Audit Logger [icon: file-text]: Log action
```

---

## 4. Data Flow — Document RAG

```
// Document RAG Pipeline
User [icon: user] > Upload API [icon: upload]: POST /documents/upload
Upload API > R2 Storage [icon: cloud]: Store original file
Upload API > Celery Queue [icon: list]: Enqueue processing
Celery Queue > Document Worker [icon: settings]: Process document

Document Worker {
  PDF Parser [icon: file-text]
  Image OCR [icon: image]
  Audio Whisper [icon: mic]
  Text Chunker [icon: scissors]: 512 tokens, 64 overlap
  Embedder [icon: cpu]: text-embedding-3-small
}

Document Worker > Supabase [icon: database]: Store chunks + embeddings
Document Worker > Status Update [icon: check]: Mark as ready

User > Query API [icon: search]: POST /documents/query
Query API > Embedder [icon: cpu]: Embed question
Embedder > pgvector [icon: search]: Similarity search
pgvector > Reranker [icon: sort-desc]: Re-rank results
Reranker > LLM [icon: brain]: Generate answer with context
LLM > User: Answer with sources
```

---

## 5. Deployment Architecture

```
// ATHENA Deployment
GitHub [icon: github] {
  Main Branch [icon: git-branch]
  Develop Branch [icon: git-branch]
  Feature Branches [icon: git-branch]
}

GitHub Actions [icon: play, color: blue] {
  Lint [icon: check]
  Test [icon: test-tube]
  Build [icon: package]
  Deploy [icon: rocket]
}

Vercel [icon: vercel] {
  Production [icon: globe]: main branch
  Preview [icon: eye]: PR branches
  Edge CDN [icon: zap]
}

Modal [icon: cloud, color: green] {
  Production [icon: server]
  Staging [icon: server]
  Auto-scaling [icon: trending-up]
}

GitHub > GitHub Actions: Push/PR trigger
GitHub Actions > Vercel: Frontend deploy
GitHub Actions > Modal: Backend deploy

Vercel > Users [icon: users]: Serve frontend
Modal > Vercel: API responses

Supabase [icon: database, color: green]: Managed PostgreSQL
Upstash [icon: zap, color: red]: Managed Redis
Neo4j AuraDB [icon: share-2, color: blue]: Managed Graph
Cloudflare R2 [icon: cloud, color: orange]: Object Storage
```

---

## 6. Security Architecture

```
// ATHENA Security Layers
Internet [icon: globe] > Vercel Edge [icon: shield]: CDN + DDoS protection
Vercel Edge > Next.js [icon: nextjs]: CSP + Security headers
Next.js > FastAPI [icon: server]: HTTPS only

FastAPI {
  Layer 1: JWT Validation [icon: key]
  Layer 2: Tenant Resolution [icon: users]
  Layer 3: Rate Limiting [icon: clock]: Redis-backed
  Layer 4: Input Validation [icon: check-circle]: Pydantic strict
  Layer 5: Audit Logging [icon: file-text]: Every mutation
  Layer 6: Business Logic [icon: cpu]
}

FastAPI > Supabase [icon: database] {
  RLS Policies [icon: shield]: tenant_id isolation
  Encrypted Connections [icon: lock]: SSL/TLS
  No Raw SQL [icon: x]: ORM only
}

FastAPI > Redis [icon: zap]: Rate limit counters
FastAPI > Audit Log [icon: file-text]: Immutable event log
```
