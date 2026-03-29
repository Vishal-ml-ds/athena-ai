# ATHENA — High-Level Architecture

> Personal AI Operating System | Multi-Tenant SaaS
> Last updated: 2026-03-29

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Service Topology](#2-service-topology)
3. [Communication Patterns](#3-communication-patterns)
4. [Agent Orchestration](#4-agent-orchestration)
5. [Data Flows](#5-data-flows)
6. [Security Architecture](#6-security-architecture)
7. [Deployment Architecture](#7-deployment-architecture)
8. [Key Architecture Decisions](#8-key-architecture-decisions)
9. [Module Boundaries](#9-module-boundaries)
10. [Non-Functional Requirements](#10-non-functional-requirements)

---

## 1. System Overview

ATHENA is a multi-tenant Personal AI Operating System that orchestrates six specialized AI agents through a supervisor pattern. Users interact via chat, voice, or automated workflows. The system manages documents, browses the web, tracks habits/goals/finance, and builds a persistent knowledge graph per user.

```
+------------------------------------------------------------------+
|                        CLIENT LAYER                               |
|                                                                   |
|   +-------------------+  +------------------+  +---------------+  |
|   |   Next.js Web     |  |   Mobile PWA     |  |  Voice (Mic)  |  |
|   |   (Vercel)        |  |   (same app)     |  |  WebSocket    |  |
|   +--------+----------+  +--------+---------+  +-------+-------+  |
|            |                      |                     |          |
+------------------------------------------------------------------+
             |                      |                     |
             v                      v                     v
+------------------------------------------------------------------+
|                       API GATEWAY LAYER                           |
|                                                                   |
|   +------------------------------------------------------------+ |
|   |              FastAPI — Modular Monolith (Modal)             | |
|   |                                                             | |
|   |  +--------+ +--------+ +--------+ +--------+ +---------+   | |
|   |  |  Auth  | |  Chat  | | Voice  | |  Docs  | | Agents  |   | |
|   |  | Module | | Module | | Module | | Module | | Module  |   | |
|   |  +--------+ +--------+ +--------+ +--------+ +---------+   | |
|   |  +--------+ +--------+ +--------+ +--------+ +---------+   | |
|   |  | Memory | | Browse | |  Life  | | Finance| |  Admin  |   | |
|   |  | Module | | Module | | Module | | Module | |  Module |   | |
|   |  +--------+ +--------+ +--------+ +--------+ +---------+   | |
|   +------------------------------------------------------------+ |
|                                                                   |
+------------------------------------------------------------------+
             |              |              |              |
             v              v              v              v
+------------------------------------------------------------------+
|                       DATA LAYER                                  |
|                                                                   |
|  +-----------+ +-----------+ +-----------+ +------------------+   |
|  | Supabase  | | Neo4j     | | Upstash   | | Cloudflare R2    |   |
|  | PostgreSQL| | AuraDB    | | Redis     | | Object Storage   |   |
|  | + pgvector| | Knowledge | | Cache +   | | Files, Images,   |   |
|  | + Auth    | | Graph     | | Celery    | | Audio             |   |
|  | + RLS     | |           | | Broker    | |                   |   |
|  +-----------+ +-----------+ +-----------+ +------------------+   |
|                                                                   |
+------------------------------------------------------------------+
```

---

## 2. Service Topology

### 2.1 Frontend (Next.js 15 on Vercel)

```
+------------------------------------------------------+
|                  Next.js 15 App Router                |
|                                                       |
|  +------------+  +-----------+  +------------------+  |
|  | Chat UI    |  | Dashboard |  | Voice Interface  |  |
|  | (streaming)|  | (habits,  |  | (push-to-talk +  |  |
|  |            |  |  goals,   |  |  hands-free)     |  |
|  |            |  |  finance) |  |                   |  |
|  +------------+  +-----------+  +------------------+  |
|  +------------+  +-----------+  +------------------+  |
|  | Document   |  | Settings  |  | Knowledge Graph  |  |
|  | Manager    |  | & Profile |  | Visualizer       |  |
|  +------------+  +-----------+  +------------------+  |
|                                                       |
|  Shared: shadcn/ui + Tailwind + Zustand state mgmt   |
|  Auth: Supabase Auth (JWT in httpOnly cookies)        |
+------------------------------------------------------+
```

**Responsibilities:**
- Renders all UI screens (chat, dashboard, docs, settings)
- Handles SSE streaming for agent responses
- WebSocket connection for voice
- Supabase Auth client (login, signup, OAuth, session refresh)
- Client-side state with Zustand (no Redux overhead)
- All API calls go through a typed fetch wrapper

### 2.2 Backend (FastAPI on Modal)

```
+-------------------------------------------------------------+
|              FastAPI Modular Monolith                         |
|                                                              |
|  +---------+   +-------------------------------------------+|
|  | Startup |   |           Module Layer                     ||
|  | - env   |   |                                            ||
|  |   valid |   |  auth/  chat/  voice/  documents/          ||
|  | - DB    |   |  agents/  memory/  browser/                ||
|  |   pool  |   |  life/  finance/  admin/                   ||
|  | - Redis |   |                                            ||
|  |   conn  |   |  Each module has:                          ||
|  | - Neo4j |   |    routes.py   (thin — validation only)    ||
|  |   driver|   |    service.py  (business logic)            ||
|  +---------+   |    repository.py (DB queries)              ||
|                |    schemas.py  (Pydantic models)            ||
|  +---------+   |    dependencies.py (DI)                    ||
|  | Shared  |   +-------------------------------------------+||
|  | - auth  |                                                 |
|  |   guard |   +-------------------------------------------+|
|  | - rate  |   |           Infrastructure Layer             ||
|  |   limit |   |                                            ||
|  | - audit |   |  database.py  redis.py  neo4j.py           ||
|  |   log   |   |  storage.py   celery_app.py                ||
|  | - error |   |  config.py    middleware.py                 ||
|  |   handler|  +-------------------------------------------+|
|  +---------+                                                 |
+-------------------------------------------------------------+
```

**Module registry pattern:** Each module exposes a `router` that gets mounted in `app.py`. Modules never import from each other directly — shared logic lives in `core/`.

### 2.3 Data Layer

| Service | Purpose | Why This Choice |
|---------|---------|-----------------|
| **Supabase PostgreSQL** | Primary OLTP store — users, chats, messages, habits, goals, transactions | Managed Postgres with built-in Auth, RLS, and realtime |
| **pgvector** | Embedding storage for RAG — document chunks, memory embeddings | Same DB, no separate vector service, cosine similarity search |
| **Neo4j AuraDB** | Knowledge graph — entity relationships, user concept maps | Graph-native traversals, Cypher queries, no awkward SQL JOINs for graph data |
| **Upstash Redis** | Cache (hot data, rate limits) + Celery message broker | Serverless Redis, HTTP-based, perfect for Modal's stateless functions |
| **Cloudflare R2** | File storage — uploaded docs, images, audio recordings | S3-compatible, zero egress fees, global CDN |

---

## 3. Communication Patterns

```
+----------+         +----------+         +----------+
|          |  REST   |          | SQLAlch |          |
| Frontend +-------->+ FastAPI  +-------->+ Supabase |
|          |<--------+          |<--------+          |
|          |  JSON   |          |  async  |          |
+----+-----+         +----+-----+         +----------+
     |                     |
     | SSE (streaming)     | Celery (async tasks)
     |<--------------------+------------------+
     |                     |                  |
     | WebSocket (voice)   |    +----------+  |  +----------+
     |<------------------->+    | Upstash  |  +->| Neo4j    |
     |                     |    | Redis    |     | AuraDB   |
     |                     |    +----------+     +----------+
     |                     |
     |                     |    +----------+
     |                     +--->| Cloudflare|
     |                          | R2       |
     |                          +----------+
```

### Pattern Matrix

| Pattern | Use Case | Direction | Protocol |
|---------|----------|-----------|----------|
| **REST** | CRUD operations, auth, settings, data queries | Request/Response | HTTPS + JSON |
| **SSE** | Agent response streaming (token-by-token) | Server → Client | EventSource |
| **WebSocket** | Voice (bidirectional audio + function calls) | Bidirectional | WSS |
| **Celery Tasks** | Document processing, embedding generation, browser jobs, scheduled tasks | Async fire-and-forget | Redis broker |
| **Webhooks** | Supabase Auth events, payment callbacks | External → Server | HTTPS POST |

### REST API Conventions

```
Base:  /api/v1

Auth:       POST /auth/signup, /auth/login, /auth/refresh
Chat:       POST /chat/send, GET /chat/{id}/messages
Agents:     POST /agents/invoke, GET /agents/status/{task_id}
Documents:  POST /documents/upload, GET /documents/{id}
Memory:     GET /memory/search?q=..., POST /memory/save
Life:       GET /life/habits, POST /life/goals
Finance:    GET /finance/summary, POST /finance/transactions
Voice:      WS  /voice/stream
Health:     GET /health, GET /health/ready
```

---

## 4. Agent Orchestration

### 4.1 LangGraph Supervisor Pattern

```
                         User Message
                              |
                              v
                    +-------------------+
                    |    SUPERVISOR     |
                    |   (GPT-4o/Claude) |
                    |                   |
                    |  - Classify intent|
                    |  - Route to agent |
                    |  - Merge results  |
                    |  - Handle errors  |
                    +---+---+---+---+---+
                        |   |   |   |
           +------------+   |   |   +------------+
           |        +-------+   +-------+        |
           v        v                   v        v
     +---------+ +---------+     +---------+ +---------+
     |RESEARCHER| |SCHEDULER|     |  CODER  | | BROWSER |
     |         | |         |     |         | |         |
     | - Web   | | - Cal   |     | - Code  | | - Nav   |
     |   search| |   manage|     |   gen   | |   pages |
     | - News  | | - Remind|     | - Debug | | - Scrape|
     | - Papers| | - Plan  |     | - Explain| | - Fill |
     +---------+ +---------+     +---------+ +---------+
           |        |                   |        |
           v        v                   v        v
     +---------+ +---------+     +---------+
     |LIFE COACH| | FINANCE |     | (future)|
     |         | |         |     |         |
     | - Habits| | - Track |     | - Music |
     | - Goals | | - Budget|     | - Health|
     | - Review| | - Invest|     | - Social|
     +---------+ +---------+     +---------+
```

### 4.2 Execution Modes

**Sequential (default):** Supervisor routes to one agent, waits for result, responds.

```
User: "What's the latest on AI regulation?"
  |
  v
Supervisor -> intent: research -> Researcher Agent
  |                                     |
  |           tool_call: web_search     |
  |           tool_call: news_search    |
  |           <--- results ---          |
  v
Supervisor -> format + respond -> User
```

**Parallel (multi-intent):** Supervisor detects multiple intents, fans out to agents, merges.

```
User: "Research X and schedule a meeting about it"
  |
  v
Supervisor -> [research_intent, schedule_intent]
  |
  +---> Researcher Agent ---> results ----+
  |                                       |
  +---> Scheduler Agent  ---> results ----+
  |                                       |
  v                                       v
Supervisor <-------- merge results --------
  |
  v
User: formatted combined response
```

### 4.3 ReAct Loop (per agent)

Each agent runs a ReAct (Reason + Act) loop:

```
+---> THINK: "I need to search for X"
|         |
|         v
|    ACT: tool_call(web_search, query="X")
|         |
|         v
|    OBSERVE: tool returns results
|         |
|         v
|    THINK: "Results are insufficient, refine query"
|         |
+----<----+ (loop back, max 5 iterations)
          |
          v (when satisfied)
     RESPOND: final answer to supervisor
```

### 4.4 Semantic Routing

The supervisor classifies intent using a lightweight classifier (not the full LLM):

```
User message
     |
     v
+----------------------------+
| Intent Classifier          |
| (embedding similarity to   |
|  agent descriptions)       |
+----------------------------+
     |
     +---> similarity > 0.85  --> route to best match agent
     |
     +---> similarity < 0.85  --> fall back to LLM routing
     |
     +---> multi-intent       --> fan out to multiple agents
```

**Agent routing table:**

| Agent | Triggers | Tools |
|-------|----------|-------|
| Researcher | search, find, look up, what is, latest news | web_search, news_api, arxiv, wikipedia |
| Scheduler | schedule, remind, calendar, when, meeting | google_calendar, reminders_db |
| Life Coach | habit, goal, review, motivation, track | habits_db, goals_db, journal_db |
| Coder | code, debug, explain, build, fix, script | code_executor, github_api |
| Browser | open, click, fill, scrape, screenshot, navigate | playwright_browser |
| Finance | budget, spend, expense, invest, savings | transactions_db, plaid_api |

### 4.5 State Management (LangGraph)

```python
# Simplified state schema
class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    current_agent: str | None
    pending_agents: list[str]
    tool_results: dict[str, Any]
    iteration_count: int           # ReAct loop counter
    user_id: str                   # tenant isolation
    memory_context: list[str]      # retrieved memories
    error: str | None
```

LangGraph compiles this into a state machine with checkpointing. If a Modal function crashes mid-execution, the graph resumes from the last checkpoint.

---

## 5. Data Flows

### 5.1 Chat Message Flow

```
User types message
     |
     v
[Frontend] POST /api/v1/chat/send
     |  { conversation_id, content, attachments? }
     |
     v
[Auth Middleware] validate JWT, extract user_id
     |
     v
[Chat Service]
     |-- save user message to DB (messages table)
     |-- retrieve conversation history (last N messages)
     |-- retrieve relevant memories (pgvector similarity search)
     |-- retrieve knowledge graph context (Neo4j)
     |
     v
[Agent Orchestrator]
     |-- supervisor classifies intent
     |-- routes to agent(s)
     |-- agent executes ReAct loop with tools
     |-- supervisor formats final response
     |
     v
[SSE Stream] token-by-token to frontend
     |
     v
[Post-Processing] (async Celery task)
     |-- save assistant message to DB
     |-- extract entities -> Neo4j knowledge graph
     |-- extract memories -> embed -> pgvector
     |-- update conversation summary
```

### 5.2 Document Upload + RAG Flow

```
User uploads PDF/DOCX
     |
     v
[Frontend] POST /api/v1/documents/upload (multipart)
     |
     v
[Documents Service]
     |-- validate file type + size (max 50MB)
     |-- upload raw file to Cloudflare R2
     |-- save document metadata to DB (status: "processing")
     |-- dispatch Celery task
     |-- return 202 Accepted + document_id
     |
     v
[Celery Worker — process_document]
     |
     +---> [Extract Text]
     |     - PDF: PyMuPDF (fitz)
     |     - DOCX: python-docx
     |     - Images: GPT-4o Vision OCR
     |
     +---> [Chunk Text]
     |     - Recursive character splitter
     |     - 512 tokens per chunk, 50 token overlap
     |     - Preserve paragraph boundaries
     |
     +---> [Generate Embeddings]
     |     - OpenAI text-embedding-3-small (1536 dims)
     |     - Batch embed all chunks
     |
     +---> [Store in pgvector]
     |     - document_chunks table
     |     - (chunk_text, embedding, document_id, user_id, metadata)
     |
     +---> [Extract Entities -> Neo4j]
     |     - LLM extracts people, orgs, concepts, dates
     |     - Create/merge nodes + relationships
     |
     +---> [Update Status]
           - document metadata -> status: "ready"
           - notify frontend via SSE
```

### 5.3 Voice Flow

```
User taps mic
     |
     v
[Frontend] opens WebSocket to /api/v1/voice/stream
     |
     v
[Voice Module — WebSocket handler]
     |
     +---> [Upstream: OpenAI Realtime API]
     |     - Audio chunks forwarded in real-time
     |     - Realtime API handles:
     |       - Speech-to-text (Whisper built-in)
     |       - LLM reasoning
     |       - Text-to-speech (voice output)
     |       - Function calling (tool use)
     |
     |     When function_call received:
     |       +---> Parse function name + args
     |       +---> Execute via Agent Orchestrator
     |       +---> Return result to Realtime API
     |       +---> Realtime API speaks the response
     |
     +---> [Downstream: Audio to Frontend]
           - TTS audio chunks streamed back
           - Frontend plays via Web Audio API
     |
     v
[Post-Processing]
     |-- save transcript to messages table
     |-- standard memory/knowledge extraction
```

### 5.4 Memory System Flow

```
Every conversation turn triggers:
     |
     v
[Memory Extraction] (Celery background task)
     |
     +---> [Short-Term Memory]
     |     - Last 20 messages in conversation
     |     - Stored in Redis (TTL: 24 hours)
     |     - Fast retrieval, no embedding needed
     |
     +---> [Long-Term Memory — Episodic]
     |     - LLM extracts factual statements
     |     - "User prefers morning meetings"
     |     - "User is allergic to peanuts"
     |     - Embed with text-embedding-3-small
     |     - Store in pgvector (memories table)
     |     - Deduplicate: cosine similarity > 0.95 = same memory
     |
     +---> [Long-Term Memory — Semantic]
     |     - Entity extraction -> Neo4j
     |     - (User)-[:PREFERS]->(Morning Meetings)
     |     - (User)-[:WORKS_AT]->(NBC)
     |     - Graph grows with every conversation
     |
     +---> [Retrieval at Query Time]
           |
           +---> pgvector: top-K similar memories (cosine)
           +---> Neo4j: graph traversal from mentioned entities
           +---> Redis: recent conversation context
           +---> Merge + rank by relevance + recency
           +---> Inject into system prompt
```

### 5.5 Browser Automation Flow

```
User: "Go to LinkedIn and check my messages"
     |
     v
[Supervisor] -> routes to Browser Agent
     |
     v
[Browser Agent — ReAct Loop]
     |
     +---> THINK: "I need to open LinkedIn and navigate to messages"
     |
     +---> ACT: tool_call(browser_navigate, url="linkedin.com")
     |     |
     |     v
     |     [Celery Task -> Modal GPU Function]
     |       - Playwright launches Chromium (headless)
     |       - Navigates to URL
     |       - Takes screenshot
     |       - Returns screenshot + page HTML summary
     |
     +---> OBSERVE: screenshot shows login page
     |
     +---> THINK: "User needs to be logged in, use stored session"
     |
     +---> ACT: tool_call(browser_click, selector="#messages-tab")
     |     |
     |     v
     |     [Playwright clicks, takes new screenshot]
     |
     +---> OBSERVE: messages list visible
     |
     +---> RESPOND: "You have 3 new messages: ..."
     |
     v
[Screenshots stored in R2 for audit trail]
[Page context extracted for memory system]
```

---

## 6. Security Architecture

### 6.1 Auth Stack

```
+-----------------------------------------------------------+
|                    Authentication Flow                      |
|                                                            |
|  [Browser]                                                 |
|     |                                                      |
|     +---> Supabase Auth (signup/login/OAuth)               |
|     |     - Google, GitHub OAuth providers                 |
|     |     - Email + password with email verification       |
|     |     - Returns JWT (access + refresh tokens)          |
|     |                                                      |
|     +---> JWT stored in httpOnly, Secure, SameSite=Strict  |
|     |     cookie (NOT localStorage)                        |
|     |                                                      |
|     +---> Every API request includes cookie                |
|           |                                                |
|           v                                                |
|     [FastAPI Auth Middleware]                               |
|           |                                                |
|           +---> Validate JWT signature (Supabase public key)|
|           +---> Check token expiry                         |
|           +---> Extract user_id, email, role               |
|           +---> Attach to request.state.user               |
|           +---> If expired -> 401 -> frontend refreshes    |
|                                                            |
+-----------------------------------------------------------+
```

### 6.2 Multi-Tenant Isolation

```
                    Every Database Query
                          |
                          v
              +------------------------+
              | Row-Level Security     |
              | (Supabase RLS)         |
              |                        |
              | Policy:                |
              | auth.uid() = user_id   |
              |                        |
              | Applied to ALL tables: |
              | - messages             |
              | - documents            |
              | - document_chunks      |
              | - memories             |
              | - habits               |
              | - goals                |
              | - transactions         |
              | - browser_sessions     |
              +------------------------+

Additionally enforced at application layer:
  - Repository methods always filter by user_id
  - Service layer validates user_id ownership
  - Defense in depth: RLS is the last line, not the only line
```

### 6.3 Rate Limiting

```
[Request] --> [Rate Limiter Middleware (Redis)]
                |
                +---> Global: 100 req/min per user
                +---> Chat:   20 req/min per user
                +---> Voice:  5 concurrent sessions per user
                +---> Upload: 10 req/min, 50MB per file
                +---> Agent:  10 invocations/min per user
                |
                +---> Exceeded? -> 429 Too Many Requests
                +---> Headers: X-RateLimit-Remaining, Retry-After
```

### 6.4 Security Layers Summary

| Layer | Mechanism |
|-------|-----------|
| **Transport** | HTTPS everywhere (Vercel + Modal enforce TLS) |
| **Authentication** | Supabase Auth + JWT in httpOnly cookies |
| **Authorization** | Role-based (user, admin) + resource ownership checks |
| **Tenant Isolation** | PostgreSQL RLS + application-layer user_id filtering |
| **Input Validation** | Pydantic v2 on every request body + query param |
| **Rate Limiting** | Redis sliding window per user per endpoint category |
| **CSRF** | SameSite=Strict cookies + CSRF token on state-changing requests |
| **XSS** | CSP headers, no inline scripts, sanitized HTML output |
| **Secrets** | Environment variables, validated at startup, never logged |
| **Audit** | Every state-changing request logged (user_id, action, timestamp, IP) |
| **File Upload** | Type allowlist, size limits, content scanning |

---

## 7. Deployment Architecture

```
+------------------------------------------------------------------+
|                        PRODUCTION                                 |
|                                                                   |
|  +------------------+      +----------------------------------+   |
|  |    VERCEL        |      |          MODAL                   |   |
|  |                  |      |                                  |   |
|  |  Next.js 15      | REST |  FastAPI App (web endpoint)      |   |
|  |  - SSR/SSG       +----->+  - Auto-scales 0 to N            |   |
|  |  - Edge Runtime  |      |  - Cold start: ~2s               |   |
|  |  - CDN (global)  | SSE  |  - Warm: <100ms                  |   |
|  |  - Preview deploys+<----+                                  |   |
|  |                  |      |  Celery Workers (Modal functions) |   |
|  |  Env:            | WS   |  - Document processing            |   |
|  |  - NEXT_PUBLIC_  +<---->+  - Embedding generation           |   |
|  |    API_URL       |      |  - Browser automation (GPU)       |   |
|  |  - SUPABASE keys |      |  - Memory extraction              |   |
|  +------------------+      |  - Scheduled jobs (cron)          |   |
|                            +----------------------------------+   |
|                                                                   |
|  +------------------+      +----------------------------------+   |
|  |  SUPABASE        |      |      EXTERNAL SERVICES           |   |
|  |                  |      |                                  |   |
|  |  PostgreSQL 15   |      |  Neo4j AuraDB (knowledge graph)  |   |
|  |  + pgvector      |      |  Upstash Redis (cache + broker)  |   |
|  |  + Auth          |      |  Cloudflare R2 (file storage)    |   |
|  |  + RLS policies  |      |  OpenAI API (LLM + embeddings)   |   |
|  |  + Realtime      |      |  Anthropic API (Claude fallback)  |   |
|  |  + Edge Functions|      |                                  |   |
|  +------------------+      +----------------------------------+   |
|                                                                   |
+------------------------------------------------------------------+

CI/CD Pipeline:
  GitHub Actions -> lint + test -> deploy to Modal (staging)
                                -> deploy to Vercel (staging)
                 -> manual approval -> production deploy
                 -> tag release (vX.Y.Z)
```

### Environment Strategy

| Environment | Frontend | Backend | Database |
|-------------|----------|---------|----------|
| **Local** | `next dev` | `uvicorn` (local) | Supabase local (Docker) |
| **Staging** | Vercel preview branch | Modal staging app | Supabase staging project |
| **Production** | Vercel main branch | Modal prod app | Supabase prod project |

### Scaling Characteristics

| Component | Scaling Model | Limits |
|-----------|--------------|--------|
| Vercel (frontend) | Edge, auto-scale | Serverless, ~25 regions |
| Modal (backend) | Serverless, auto-scale 0-to-N | CPU: 100 concurrent, GPU: 10 concurrent |
| Supabase (DB) | Vertical (plan-based) | Pro plan: 8GB RAM, 100GB storage |
| Neo4j Aura | Managed, plan-based | Free: 200K nodes, Pro: unlimited |
| Upstash Redis | Serverless, auto-scale | 10K commands/day (free), unlimited (paid) |
| R2 | Unlimited | Zero egress fees |

---

## 8. Key Architecture Decisions

### ADR-001: LangGraph over CrewAI

| | LangGraph | CrewAI |
|---|-----------|--------|
| **Control** | Explicit state machine, full graph control | Agent-to-agent delegation, less predictable |
| **Debugging** | Visualize graph, inspect state at every node | Black-box agent conversations |
| **Streaming** | Native token streaming from any node | Requires workarounds |
| **Checkpointing** | Built-in state persistence + resume | Not supported natively |
| **Parallel Exec** | Fan-out/fan-in with explicit merge | Sequential by default |

**Decision:** LangGraph. ATHENA needs deterministic routing, debuggable flows, and streaming — all first-class in LangGraph. CrewAI's "agents talking to agents" model is elegant for demos but unpredictable in production.

### ADR-002: Modular Monolith over Microservices

| | Modular Monolith | Microservices |
|---|-------------------|---------------|
| **Complexity** | Single deploy, single repo | N deploys, N repos, service mesh |
| **Latency** | In-process function calls | Network hops between services |
| **Dev Speed** | One developer ships fast | Needs team per service |
| **Refactoring** | Move code between modules | Move code between repos + APIs |
| **Scaling** | Scale the whole app | Scale individual services |

**Decision:** Modular monolith. ATHENA is built by a solo developer. Microservices add operational overhead (service discovery, distributed tracing, API contracts) with no benefit at this scale. Module boundaries enforce separation — if a module needs to become a service later, the clean interface makes extraction straightforward.

### ADR-003: pgvector over Pinecone

| | pgvector | Pinecone |
|---|----------|----------|
| **Infrastructure** | Same Supabase DB | Separate managed service |
| **Cost** | Free (included in Supabase) | $70/mo for 1M vectors |
| **Latency** | Single DB query (no network hop) | Additional network call |
| **Joins** | SQL JOINs with metadata tables | Metadata filtering only |
| **Scale** | Good to ~5M vectors with HNSW | Billions of vectors |

**Decision:** pgvector. ATHENA's per-user vector count will stay well under 1M vectors for years. pgvector eliminates a separate service, reduces latency (same DB), and allows SQL JOINs between vectors and metadata. If scale demands it later, Pinecone is a drop-in replacement at the repository layer.

### ADR-004: Neo4j for Knowledge Graph

| | Neo4j | PostgreSQL (recursive CTEs) | NetworkX (in-memory) |
|---|-------|---------------------------|---------------------|
| **Graph queries** | Cypher: native, readable | SQL CTEs: verbose, fragile | Python: no persistence |
| **Traversal** | O(1) per hop | O(n) per join | O(1) but RAM-limited |
| **Visualization** | Built-in Neo4j Browser | None | Matplotlib (ugly) |
| **Scale** | Millions of nodes | Slows at depth > 3 | Memory-bound |

**Decision:** Neo4j AuraDB. Knowledge graphs are fundamentally graph problems. Queries like "what does the user know about topic X, and how does it connect to Y?" are 3-line Cypher queries but 30-line recursive SQL. Neo4j AuraDB is managed, has a free tier, and provides visualization out of the box.

### ADR-005: Modal over Railway

| | Modal | Railway |
|---|-------|---------|
| **GPU Access** | A10G, A100, H100 available | No GPUs |
| **Cold Start** | ~2s (with container snapshots) | ~5-10s |
| **Timeout** | No timeout (async functions) | 5 min (configurable) |
| **Pricing** | Pay per second of compute | Fixed container pricing |
| **Celery** | Run workers as Modal functions | Run as separate service |
| **Scaling** | Auto 0-to-N, true serverless | Container-based, minimum 1 |

**Decision:** Modal. ATHENA needs GPU access for browser automation (screenshot processing), has long-running agent tasks that exceed Railway's timeout, and benefits from scale-to-zero pricing as a bootstrapped project. Modal's Python-native SDK also eliminates Dockerfile management.

### ADR-006: Cloudflare R2 over AWS S3

| | R2 | S3 |
|---|----|----|
| **Egress** | Free | $0.09/GB |
| **API** | S3-compatible | Native |
| **CDN** | Cloudflare edge (global) | CloudFront (additional cost) |

**Decision:** R2. S3-compatible API means zero code changes if migration is ever needed. Zero egress fees matter when serving user-uploaded files.

---

## 9. Module Boundaries

```
backend/
  app/
    main.py                    # FastAPI app factory, mount all routers
    config.py                  # Settings (env vars, validated at startup)
    middleware.py               # Auth, rate limit, CORS, audit
    |
    core/                      # Shared utilities (no business logic)
      database.py              # Supabase/SQLAlchemy async engine
      redis.py                 # Upstash Redis client
      neo4j.py                 # Neo4j async driver
      storage.py               # R2 client (S3-compatible)
      celery_app.py            # Celery config with Redis broker
      security.py              # JWT validation, password hashing
      exceptions.py            # Structured error classes
      schemas.py               # Shared Pydantic base models
    |
    modules/
      auth/
        routes.py              # POST /signup, /login, /refresh, /logout
        service.py             # Signup flow, token logic, OAuth
        repository.py          # User CRUD
        schemas.py             # AuthRequest, AuthResponse, UserProfile
      |
      chat/
        routes.py              # POST /send, GET /conversations, SSE stream
        service.py             # Conversation management, agent dispatch
        repository.py          # Messages, conversations CRUD
        schemas.py             # ChatMessage, Conversation
      |
      agents/
        routes.py              # POST /invoke, GET /status
        service.py             # LangGraph orchestrator, supervisor
        graph.py               # LangGraph state machine definition
        tools/                 # Tool implementations per agent
          web_search.py
          calendar.py
          code_executor.py
          browser.py
          ...
        agents/                # Agent definitions
          researcher.py
          scheduler.py
          life_coach.py
          coder.py
          browser_agent.py
          finance.py
        schemas.py             # AgentRequest, AgentResponse, ToolCall
      |
      voice/
        routes.py              # WS /stream
        service.py             # OpenAI Realtime API bridge
        schemas.py             # VoiceEvent, TranscriptChunk
      |
      documents/
        routes.py              # POST /upload, GET /{id}, DELETE /{id}
        service.py             # Upload + dispatch processing
        repository.py          # Documents, chunks CRUD
        tasks.py               # Celery: extract, chunk, embed, store
        schemas.py             # DocumentUpload, DocumentChunk
      |
      memory/
        routes.py              # GET /search, POST /save, DELETE /{id}
        service.py             # Memory extraction, retrieval, ranking
        repository.py          # Memories CRUD (pgvector + Neo4j)
        schemas.py             # Memory, MemorySearchResult
      |
      browser/
        routes.py              # POST /navigate, POST /action
        service.py             # Playwright session management
        tasks.py               # Celery: browser automation on Modal
        schemas.py             # BrowserAction, Screenshot
      |
      life/
        routes.py              # Habits, goals, journal endpoints
        service.py             # Habit tracking, goal progress, reviews
        repository.py          # Life data CRUD
        schemas.py             # Habit, Goal, JournalEntry
      |
      finance/
        routes.py              # Transactions, budgets, summaries
        service.py             # Expense tracking, budget analysis
        repository.py          # Finance data CRUD
        schemas.py             # Transaction, Budget, FinanceSummary
      |
      admin/
        routes.py              # User management, system stats
        service.py             # Admin operations
        schemas.py             # AdminStats, UserManagement
```

### Inter-Module Communication Rules

1. Modules never import from each other's internals
2. If module A needs module B's data, it goes through B's service layer
3. Shared types live in `core/schemas.py`
4. Cross-module events use Celery tasks (loose coupling)
5. The `agents` module is the only one that orchestrates other modules

---

## 10. Non-Functional Requirements

| Requirement | Target | How |
|-------------|--------|-----|
| **Response Time** | Chat: <2s first token, <10s full response | SSE streaming, Redis cache for context |
| **Availability** | 99.5% uptime | Managed services (Supabase, Modal, Vercel) |
| **Scalability** | 1,000 concurrent users | Modal auto-scale, Supabase Pro, Redis cache |
| **Data Retention** | Unlimited for paying users, 30 days free | Configurable per plan |
| **Cold Start** | <3s for first request | Modal container snapshots, connection pooling |
| **Embedding Latency** | <500ms per chunk | Batch embedding, async processing |
| **Voice Latency** | <300ms round-trip | WebSocket direct to OpenAI Realtime API |
| **File Upload** | Max 50MB, PDF/DOCX/TXT/MD/images | Validated at API boundary |
| **Observability** | Structured logging + error tracking | JSON logs, Sentry, Modal dashboard |
| **Cost** | <$50/mo at MVP scale | Serverless (pay-per-use), free tiers |

---

## Appendix: Technology Version Matrix

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.11+ | Backend runtime |
| FastAPI | 0.115+ | API framework |
| Next.js | 15 | Frontend framework |
| TypeScript | 5.x | Frontend language |
| Tailwind CSS | 4.x | Styling |
| shadcn/ui | latest | Component library |
| LangGraph | 0.2+ | Agent orchestration |
| SQLAlchemy | 2.0+ | ORM (async) |
| Pydantic | 2.x | Validation |
| Celery | 5.x | Task queue |
| Playwright | 1.x | Browser automation |
| pgvector | 0.7+ | Vector extension |
| Neo4j | 5.x | Knowledge graph |
