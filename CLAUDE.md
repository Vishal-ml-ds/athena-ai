# ATHENA — Personal AI Operating System

## What Is This?
Multi-tenant SaaS — a Personal AI OS with true multi-agent orchestration, voice-first interface, browser automation, document RAG, and life management (habits, goals, finance, health).

## Stack
- **Frontend:** Next.js 15 + TypeScript + Tailwind + shadcn/ui → Vercel
- **Backend:** FastAPI (Python) → Modal (serverless + GPU)
- **Database:** Supabase (PostgreSQL + pgvector + Auth + RLS)
- **Agents:** LangGraph (supervisor + 6 specialized agents)
- **Cache/Queue:** Redis (Upstash) + Celery
- **Knowledge Graph:** Neo4j AuraDB
- **Voice:** OpenAI Realtime API + Whisper
- **Browser:** Playwright on Modal

## Architecture
Modular monolith — single FastAPI app with strict module boundaries. Frontend is separate Next.js app.

## Key Rules
- Multi-tenant from day 1 — RLS on every table
- Every endpoint authenticated + rate limited + audit logged
- No hardcoded secrets — all in env vars
- Pydantic validation on every API boundary
- Follow sprint plan in sprints/ directory
- Update context/PROGRESS.md after every session

## Git Workflow
feature/<name> → development → testing → main
Conventional commits: feat:, fix:, refactor:, docs:, test:, chore:
