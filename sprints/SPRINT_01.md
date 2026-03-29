# Sprint 1: Foundation

**Duration:** Days 1-7
**Goal:** Walking skeleton — auth works, one agent responds, basic chat UI

---

## Backend Tasks

### B1.1 — FastAPI Project Scaffolding
- Create modular project structure (core/, routers/, services/, agents/, models/, workers/)
- `main.py` with FastAPI app, CORS, exception handlers
- `core/config.py` — Pydantic Settings loading env vars
- `core/exceptions.py` — custom exception classes + handlers
- `models/common.py` — shared response wrapper, pagination models
- `requirements.txt` with all dependencies
- `modal_app.py` — Modal deployment config

### B1.2 — Supabase Setup & Migrations
- Create new Supabase project for ATHENA
- `sql/001_tenants_profiles.sql` — tenants, profiles tables + RLS
- `sql/002_conversations_messages.sql` — conversations, messages, agent_executions + RLS
- Enable pgvector extension
- Set up Supabase Auth (email/password + Google OAuth provider)

### B1.3 — Auth & Security Middleware
- `core/security.py` — JWT validation (Supabase tokens), extract user_id + tenant_id
- `core/middleware.py` — rate limiter (Redis), audit logger, request validator
- `core/dependencies.py` — DI for Supabase client, Redis client
- Auth routes: signup (creates tenant + profile), login, refresh token

### B1.4 — Conversation & Message Endpoints
- `routers/conversations.py` — CRUD for conversations
- `routers/conversations.py` — POST message endpoint with SSE streaming
- `services/agent_service.py` — basic agent invocation (single LangGraph node)

### B1.5 — Basic Agent (General)
- `agents/supervisor.py` — minimal LangGraph graph with one "general" node
- General agent: takes user message + system prompt → streams GPT-4o response
- Token counting and usage tracking
- Response streaming via SSE (Server-Sent Events)

### B1.6 — Redis Setup
- Upstash Redis connection
- Rate limiting implementation (sliding window, per tenant)
- Session storage helpers

---

## Frontend Tasks

### F1.1 — Next.js Project Setup
- `npx create-next-app@latest` with App Router, TypeScript, Tailwind
- Install shadcn/ui, configure theme (purple primary, amber accent)
- Install dependencies: zustand, lucide-react, framer-motion
- Set up folder structure: app/(auth)/, app/(dashboard)/, components/, lib/, hooks/
- Configure environment variables (NEXT_PUBLIC_SUPABASE_URL, etc.)

### F1.2 — Supabase Auth Integration
- `lib/supabase/client.ts` — browser client
- `lib/supabase/server.ts` — server client (for RSC)
- `lib/supabase/middleware.ts` — auth middleware for protected routes
- Middleware.ts for route protection

### F1.3 — Auth Pages
- `app/(auth)/login/page.tsx` — email/password form + Google OAuth button
- `app/(auth)/signup/page.tsx` — registration form
- Redirect to dashboard on success
- Error handling + validation

### F1.4 — Dashboard Layout
- `app/(dashboard)/layout.tsx` — sidebar + main content area
- `components/layout/sidebar.tsx` — conversation list, nav links, user avatar
- `components/layout/top-bar.tsx` — search, notifications placeholder, voice button placeholder
- Dark mode by default, theme toggle

### F1.5 — Chat Interface
- `app/(dashboard)/chat/page.tsx` — main chat page
- `components/chat/message-list.tsx` — scrollable message display
- `components/chat/message-bubble.tsx` — user/assistant messages with styling
- `components/chat/chat-input.tsx` — text input + send button
- `components/chat/conversation-sidebar.tsx` — conversation list with create/select
- SSE streaming integration (consume event stream from backend)
- Zustand store for conversations + messages state

### F1.6 — API Client
- `lib/api/client.ts` — fetch wrapper with auth headers, error handling
- `lib/api/conversations.ts` — conversation API functions
- `lib/api/auth.ts` — auth API functions

---

## Infrastructure Tasks

### I1.1 — Environment Setup
- `.env.example` already created
- Create Supabase project, get keys
- Set up Upstash Redis, get URL
- Set up Modal account, get tokens
- Create `.env` locally (never commit)

### I1.2 — Local Development
- Backend: `uvicorn app.main:app --reload --port 8000`
- Frontend: `npm run dev` (port 3000)
- Document local setup in README.md

---

## Acceptance Criteria
- [ ] User can sign up with email/password
- [ ] User can log in and see the dashboard
- [ ] User can create a new conversation
- [ ] User can send a message and receive a streamed AI response
- [ ] Conversation persists in database (reload shows history)
- [ ] Unauthorized access returns 401
- [ ] Rate limiting works (returns 429 when exceeded)
- [ ] All API endpoints have Pydantic validation

## Definition of Done
- All acceptance criteria pass
- No hardcoded secrets
- RLS policies verified (user can only see own data)
- Code committed to feature/sprint-1 branch
