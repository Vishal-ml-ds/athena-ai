# ATHENA — Task Breakdown

## Pipeline Phase (Pre-Sprint)

| # | Task | Status | Agent |
|---|------|--------|-------|
| P1 | Market research + competitor analysis | Done | researcher |
| P2 | Product decisions (name, stack, architecture) | Done | planner |
| P3 | BRD (docs/BRD.md) | Done | backend-builder |
| P4 | PRD (docs/PRD.md) | Done | backend-builder |
| P5 | Architecture (docs/ARCHITECTURE.md) | Done | backend-builder |
| P6 | DB Schema (docs/DB_SCHEMA.md) | Done | manual |
| P7 | API Spec (docs/API_SPEC.md) | Done | manual |
| P8 | Eraser Prompts (docs/ERASER_PROMPTS.md) | Done | manual |
| P9 | UI/UX Spec (docs/UI_DESIGN_SPEC.md) | In Progress | frontend-builder |
| P10 | Presentation (docs/PRESENTATION.md) | In Progress | backend-builder |
| P11 | Sprint plans (sprints/) | Sprint 1 done | manual |
| P12 | This task breakdown | Done | manual |

---

## Sprint 1: Foundation (Days 1-7)

### Backend
| # | Task | Status | Estimate |
|---|------|--------|----------|
| B1.1 | FastAPI project scaffolding | Todo | 2h |
| B1.2 | Supabase setup + migrations (tenants, profiles, conversations, messages) | Todo | 2h |
| B1.3 | Auth + security middleware (JWT, rate limiter, audit logger) | Todo | 3h |
| B1.4 | Conversation + message CRUD endpoints | Todo | 2h |
| B1.5 | Basic LangGraph agent (general, single node) + SSE streaming | Todo | 3h |
| B1.6 | Redis setup (Upstash) + rate limiting | Todo | 1h |

### Frontend
| # | Task | Status | Estimate |
|---|------|--------|----------|
| F1.1 | Next.js 15 project setup + shadcn/ui + theme | Todo | 1h |
| F1.2 | Supabase Auth integration (client + server + middleware) | Todo | 2h |
| F1.3 | Auth pages (login + signup) | Todo | 2h |
| F1.4 | Dashboard layout (sidebar + topbar + main area) | Todo | 2h |
| F1.5 | Chat interface (messages, input, streaming, conversation list) | Todo | 4h |
| F1.6 | API client (fetch wrapper + conversation/auth functions) | Todo | 1h |

### Infrastructure
| # | Task | Status | Estimate |
|---|------|--------|----------|
| I1.1 | Create Supabase project, Upstash Redis, Modal account | Todo | 1h |
| I1.2 | Local dev setup + README | Todo | 1h |

**Sprint 1 Total Estimate: ~27 hours**

---

## Sprint 2: Multi-Agent Core (Days 8-14)

| # | Task | Status | Estimate |
|---|------|--------|----------|
| B2.1 | LangGraph supervisor graph (3 agents: researcher, scheduler, general) | Todo | 4h |
| B2.2 | Semantic intent classifier (embedding-based routing) | Todo | 3h |
| B2.3 | Researcher agent + web search tool (Tavily) | Todo | 3h |
| B2.4 | Scheduler agent + mock calendar/reminder tools | Todo | 2h |
| B2.5 | ReAct loop implementation | Todo | 3h |
| B2.6 | Agent execution tracking + token usage | Todo | 2h |
| F2.1 | Agent indicator in chat UI | Todo | 2h |
| F2.2 | Agent execution visualization | Todo | 3h |
| F2.3 | Settings page | Todo | 2h |
| F2.4 | Onboarding flow (3 steps) | Todo | 2h |

---

## Sprint 3: Memory + RAG (Days 15-21)

| # | Task | Status | Estimate |
|---|------|--------|----------|
| B3.1 | Memory extraction service (post-conversation) | Todo | 3h |
| B3.2 | Memory retrieval (pgvector search + importance scoring) | Todo | 3h |
| B3.3 | Document upload + R2 storage | Todo | 2h |
| B3.4 | Document processing pipeline (Celery: parse → chunk → embed) | Todo | 4h |
| B3.5 | RAG query endpoint (embed → search → rerank → answer) | Todo | 3h |
| B3.6 | Memory CRUD API | Todo | 2h |
| F3.1 | Memory panel (searchable, deletable) | Todo | 3h |
| F3.2 | Document upload page (drag-drop, status) | Todo | 3h |
| F3.3 | "ATHENA remembers" indicator in chat | Todo | 1h |

---

## Sprint 4: Voice (Days 22-28)

| # | Task | Status | Estimate |
|---|------|--------|----------|
| B4.1 | WebSocket endpoint for voice sessions | Todo | 3h |
| B4.2 | OpenAI Realtime API integration | Todo | 4h |
| B4.3 | Function calling bridge (voice → agent tools) | Todo | 3h |
| B4.4 | Whisper fallback pipeline | Todo | 2h |
| B4.5 | Voice session storage + history | Todo | 2h |
| F4.1 | Voice button + full-screen voice mode | Todo | 3h |
| F4.2 | Waveform visualization | Todo | 2h |
| F4.3 | Live transcript display | Todo | 2h |
| F4.4 | Push-to-talk / hands-free toggle | Todo | 1h |

---

## Sprint 5: Browser Automation (Days 29-35)

| # | Task | Status | Estimate |
|---|------|--------|----------|
| B5.1 | Playwright on Modal (sandboxed containers) | Todo | 3h |
| B5.2 | Browser agent tools (navigate, click, fill, screenshot) | Todo | 4h |
| B5.3 | Vision-based element detection (GPT-4o) | Todo | 3h |
| B5.4 | Browser session management + action logging | Todo | 2h |
| F5.1 | Task creation interface | Todo | 2h |
| F5.2 | Live screenshot view | Todo | 3h |
| F5.3 | Action timeline | Todo | 2h |

---

## Sprint 6: Life OS (Days 36-42)

| # | Task | Status | Estimate |
|---|------|--------|----------|
| B6.1 | Life OS migrations (habits, goals, finance, health) | Todo | 2h |
| B6.2 | Life OS CRUD endpoints | Todo | 3h |
| B6.3 | Life Coach agent + tools | Todo | 3h |
| B6.4 | Finance advisor agent + tools | Todo | 2h |
| B6.5 | Weekly report generation (Celery) | Todo | 3h |
| B6.6 | Proactive nudge system | Todo | 2h |
| F6.1 | Life OS dashboard (tabs: habits, goals, finance, health) | Todo | 5h |
| F6.2 | Charts (recharts: donut, bar, line, heatmap) | Todo | 3h |
| F6.3 | Weekly report view | Todo | 2h |

---

## Sprint 7: Knowledge Graph + Analytics + Polish (Days 43-49)

| # | Task | Status | Estimate |
|---|------|--------|----------|
| B7.1 | Neo4j integration + entity extraction | Todo | 4h |
| B7.2 | Knowledge graph API | Todo | 2h |
| B7.3 | Analytics service (usage, agents, costs) | Todo | 3h |
| B7.4 | Performance optimization (caching, pooling) | Todo | 2h |
| F7.1 | Knowledge graph visualization (D3) | Todo | 4h |
| F7.2 | Analytics dashboard | Todo | 3h |
| F7.3 | Dark/light theme, mobile responsiveness | Todo | 3h |
| F7.4 | Error boundaries, loading states | Todo | 2h |

---

## Sprint 8: Security + Testing + Deploy + Demo (Days 50-56)

| # | Task | Status | Estimate |
|---|------|--------|----------|
| B8.1 | Security audit + hardening | Todo | 3h |
| B8.2 | API key system (developer tier) | Todo | 2h |
| B8.3 | Unit tests (80% critical path coverage) | Todo | 5h |
| B8.4 | Integration tests (agent flows, RAG) | Todo | 4h |
| B8.5 | CI/CD pipeline (GitHub Actions) | Todo | 2h |
| B8.6 | Production deployment (Modal + Vercel) | Todo | 2h |
| F8.1 | Landing page + pricing | Todo | 3h |
| F8.2 | E2E tests (Playwright) | Todo | 3h |
| F8.3 | Demo mode (seeded data) | Todo | 2h |
| F8.4 | Demo script + recording | Todo | 2h |
