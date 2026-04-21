# ATHENA — Personal AI Operating System

> **The AI Goddess That Runs Your Life**

A multi-tenant Personal AI OS with true multi-agent orchestration, voice-first interface, browser automation, and full life management. Built to be architecturally superior to every AI assistant on the market.

## What Makes ATHENA Different

| Feature | ATHENA | Competitors |
|---------|--------|-------------|
| **Multi-Agent** | 7 specialized agents with semantic intent routing | Single chatbot or prompt swapping |
| **Memory** | Semantic memory with pgvector — remembers across sessions | No memory or basic context |
| **Life OS** | Habits, goals, finance, health tracking with AI insights | Not attempted |
| **Voice** | Sub-300ms voice with Whisper + TTS | Basic or none |
| **Browser** | Playwright automation with screenshots | None |
| **Knowledge Graph** | Entity extraction and relationship mapping | None |
| **Multi-Tenant** | RLS on every table from day 1 | Single-user |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui |
| Backend | FastAPI (Python) |
| Database | Supabase (PostgreSQL + pgvector + Auth + RLS) |
| AI Gateway | Euri AI (OpenAI-compatible, 40+ models) |
| Agent Routing | Semantic intent classification via LLM |
| Cache | Redis (Upstash) |
| Voice | Whisper (STT) + TTS |
| Deployment | Vercel (frontend) + Modal (backend) |

## 7 AI Agents

| Agent | Speciality | Routes To |
|-------|-----------|-----------|
| **Researcher** | Web search, topic explanation, summarization | "Find info about...", "Explain..." |
| **Scheduler** | Calendar, reminders, time management | "Remind me...", "Plan my day" |
| **Life Coach** | Habits, goals, health, motivation | "Track my habits", "Weekly report" |
| **Coder** | Code generation, debugging, review | "Write code...", "Fix this bug" |
| **Browser** | Web automation, form filling, price comparison | "Search on Amazon", "Fill this form" |
| **Finance** | Expenses, budgets, financial analysis | "Track expenses", "Budget analysis" |
| **General** | Casual conversation, ATHENA questions | Everything else |

## Architecture

```
Frontend (Vercel)  →  FastAPI Backend (Modal)  →  Euri AI Gateway
                           ↓
              Supabase (PostgreSQL + pgvector + Auth)
              Redis (Cache + Rate Limiting)
```

**Modular Monolith** — single FastAPI app with strict module boundaries. Each module (agents, voice, memory, life, knowledge) has its own router, service, and models.

## Getting Started

### Prerequisites
- Python 3.12+
- Node.js 20+
- Supabase account (free)
- Euri AI key (free tier)

### Setup

```bash
# Clone
git clone https://github.com/Vishal-ml-ds/athena-ai.git
cd athena-ai

# Backend
cd backend
python -m venv venv
source venv/Scripts/activate  # Windows
pip install -r requirements.txt
cp ../.env.example .env  # Add your keys

# Frontend
cd ../frontend
npm install
cp .env.example .env.local  # Add your keys

# Database
# Run all SQL files in backend/sql/ via Supabase SQL Editor (in order: 001 → 006)

# Start
cd ../backend && uvicorn app.main:app --port 8005
cd ../frontend && npm run dev -- --port 3002
```

### Environment Variables

**Backend (.env)**
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://...
EURI_API_KEY=euri-...
REDIS_URL=redis://localhost:6379
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=http://localhost:8005
```

## API Endpoints (26)

| Module | Endpoints |
|--------|-----------|
| Auth | signup, login, refresh, onboarding |
| Users | get/update profile |
| Conversations | CRUD + SSE streaming messages |
| Memories | list, search, delete |
| Life OS | habits, goals, finance, health CRUD + analytics |
| Voice | transcribe, synthesize |
| Knowledge | graph visualization |
| Analytics | usage metrics |

## Project Structure

```
athena-ai/
├── backend/
│   ├── app/
│   │   ├── agents/          # Multi-agent system
│   │   ├── core/            # Config, auth, middleware
│   │   ├── models/          # Pydantic schemas
│   │   ├── routers/         # API endpoints
│   │   ├── services/        # Business logic
│   │   └── main.py          # FastAPI app
│   └── sql/                 # Database migrations
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js pages
│   │   ├── components/      # React components
│   │   ├── stores/          # Zustand state
│   │   └── lib/             # Utils, API client
│   └── docs/ui-references/  # Stitch design exports
├── docs/                    # BRD, PRD, Architecture, etc.
├── context/                 # Progress tracking
└── sprints/                 # Sprint plans
```

## Design System

**"Celestial Intelligence"** — a premium dark theme inspired by luxury AI concierge aesthetics.

- **Fonts:** Space Grotesk (headlines), Inter (body), JetBrains Mono (code)
- **Colors:** Deep obsidian (#0b1326), Nebula purple (#7c3aed / #d2bbff), Solar gold (#ffb95f)
- **Style:** Glassmorphism, no-line rule (tonal shifts over borders), editorial layout

---

ATHENA is an open-source Personal AI Operating System.
