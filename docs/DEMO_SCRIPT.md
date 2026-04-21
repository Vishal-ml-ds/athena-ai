# ATHENA — 8-Minute Demo Script

> **Audience**: Technical recruiters, hiring managers, CTOs
> **Goal**: Show ATHENA as a production-ready AI OS that demonstrates real engineering depth
> **Tagline**: "This isn't a chat app. It's a Personal AI Operating System."

---

## Pre-Demo Checklist (5 min before)

- [ ] Backend running → `cd backend && uvicorn app.main:app --port 8005`
- [ ] Frontend running → `cd frontend && npm run dev -- --port 3005`
- [ ] Seed data loaded → `cd backend && python -m scripts.seed_demo`
- [ ] Browser at `http://localhost:3005`, logged in as demo account
- [ ] Microphone permission granted (for voice demo)
- [ ] Chrome → Print dialog tested (for PDF export)
- [ ] Kill all other apps — no notifications during demo

---

## Minute 1 — The Hook (Dashboard Overview)

**What you say:**
> "ATHENA is a Personal AI OS. It's not a chatbot — it has persistent memory, understands who you are over time, and coordinates seven specialized AI agents behind the scenes."

**What you do:**
1. Open the **Dashboard** page
2. Point to the stat cards: active habits, goals in progress, recent conversations
3. "Every number here is real data from the Life OS — not hardcoded."

**Why it lands:** First impression shows a polished product, not a prototype.

---

## Minute 2 — Multi-Agent Chat

**What you say:**
> "Let's start with the brain. When I send a message, a supervisor agent reads it, classifies the intent, and routes it to the right specialist — a researcher, coder, planner, or scheduler."

**What you do:**
1. Open **Chat** → start a new conversation
2. Type: `Write me a Python function that validates an email address with regex`
3. Watch the **agent badge** appear above the response: `coder`
4. Point to the SSE streaming: "See that? Character by character, server-sent events. No polling."

Then type: `What tasks should I focus on this week to hit my goal of launching ATHENA?`
- Agent badge switches to `planner`

**Why it lands:** Live agent routing + streaming is the core differentiator.

---

## Minute 3 — Memory System

**What you say:**
> "ATHENA doesn't forget. Every conversation is automatically analysed and key facts are stored in a semantic memory layer, powered by pgvector embeddings."

**What you do:**
1. Type in chat: `What do you already know about me?`
2. ATHENA responds with facts from pre-seeded memories (name, role, goals, preferences)
3. Navigate to **Memory** page
4. Show the list of memory cards
5. Search for "AI Architect" — matching cards highlight instantly
6. "This is a real vector similarity search against 1536-dimensional embeddings."

**Why it lands:** Demonstrates full-stack AI engineering — not just API calls.

---

## Minute 4 — Life OS

**What you say:**
> "ATHENA is also your personal productivity layer. Habits, goals, finance tracking, health logs — all in one place, all feeding the AI with context."

**What you do:**
1. Open **Life** page → **Habits** tab
2. Show Morning Run streak: 5 days, Read 30min streak: 12 days
3. Click **Log** on Morning Run → streak increments to 6
4. Switch to **Goals** tab → show ATHENA Launch at 75%, Learn Spanish at 40%
5. Switch to **Finance** tab → show ₹58.5k income vs ₹26k expenses for the month
6. "Every table you see has RLS — Row Level Security. Each user can only ever see their own data."

**Why it lands:** Shows breadth (not just chat), and security awareness.

---

## Minute 5 — Knowledge Graph

**What you say:**
> "The most impressive part — ATHENA builds a living knowledge graph from your conversations. No manual input. It extracts entities automatically."

**What you do:**
1. Open **Knowledge** page
2. 8 nodes are visible in circular layout: Author, ATHENA, FastAPI, Next.js, Supabase, NBC, LangGraph, AI Architect Mastery
3. Click on **ATHENA** node → detail panel opens on the right
4. Show the connections: "ATHENA uses FastAPI, Next.js, Supabase, LangGraph"
5. Click **Edit** → update description inline → Save
6. Use filter chips at top to filter by `skill` type → only FastAPI, Next.js, LangGraph visible
7. "Every conversation grows this graph. After every chat message, the system calls an entity extractor and upserts nodes + edges."

**Why it lands:** Knowledge graph + auto-extraction is advanced AI product engineering.

---

## Minute 6 — Documents RAG

**What you say:**
> "ATHENA can reason over your documents. Upload any PDF, text, or markdown file — it gets chunked, embedded, and indexed for semantic search."

**What you do:**
1. Open **Documents** page
2. Drag any PDF onto the upload zone (or click to select — use a short 1–2 page PDF)
3. Status shows `processing` → `ready` after a few seconds
4. In the query bar: type `What is the main topic of this document?`
5. Answer appears below with source citations
6. "The pipeline: PyMuPDF text extraction → 500-token chunks → Euri embeddings → pgvector RPC → LLM synthesis. All in-house, no LangChain dependency."

**Why it lands:** RAG is the most requested enterprise AI feature right now.

---

## Minute 7 — Voice + Insights

**Voice (90 seconds):**

> "ATHENA is voice-first. Click the microphone, speak, and it transcribes via Whisper and responds with a natural voice."

1. Click the **voice button** in the chat header
2. Speak: "Set a reminder to review the ML paper at 2pm tomorrow"
3. Show transcript appearing, agent badge `scheduler` visible
4. TTS plays the response
5. "This is the hands-free loop — when hands-free mode is on, the mic reopens automatically after each response."

**Insights (30 seconds):**

1. Open **Insights** page
2. Switch filter from **30D** to **7D** → stat cards update with new numbers
3. Scroll to **Agent Distribution** chart — bars show researcher/coder/planner usage
4. "Every API call here is the real analytics endpoint — live data from the conversations you've seen."

---

## Minute 8 — Report + Deployment Story

**Report (30 seconds):**

1. Open **Report** page
2. "Every week ATHENA compiles a summary across all Life OS modules."
3. Click **Export PDF** → Chrome print dialog opens
4. "Zero dependencies — uses the browser's native print API with a custom print stylesheet."
5. Click **Share** → "Link copied" toast → "Navigator clipboard API."

**Deployment story (90 seconds):**

> "This is fully deployed. Backend on Modal — serverless Python, scales to zero, cold start under 3 seconds. Frontend on Vercel. Database on Supabase with 6 production migrations."

Show terminal or point to architecture:
- Modal handles compute — FastAPI + LangGraph + PyMuPDF all containerized
- Vercel CI/CD — every push to main auto-deploys
- Supabase: PostgreSQL + pgvector + Auth + RLS + Storage
- GitHub Actions: parallel deploy workflow

> "Total cloud cost for a single user: ~$0/month. Supabase free tier, Modal scales to zero, Vercel hobby."

---

## Closing Line

> "ATHENA is one product — but it demonstrates twelve engineering domains: multi-agent orchestration, RAG, semantic memory, knowledge graphs, SSE streaming, voice AI, multi-tenant architecture, Pydantic validation, pgvector, serverless deployment, CI/CD, and production security. That's what an AI Architect builds."

---

## Fallback Answers to Tough Questions

| Question | Answer |
|---|---|
| "Why Euri AI instead of OpenAI?" | "Free tier, OpenAI-compatible API — swappable in one env var. Production would use Claude or GPT-4o." |
| "Does this scale?" | "Modal auto-scales. Supabase handles 500+ concurrent connections. The architecture supports horizontal scaling — I'd add Redis pub/sub for multi-instance SSE." |
| "What would you do differently?" | "Replace the LangGraph supervisor with an MCP-native tool-call loop — reduces latency by removing graph serialization overhead." |
| "How long did this take?" | "One sprint — 8 days of focused AI-assisted engineering. The goal was to prove velocity, not just capability." |
| "What's next for ATHENA?" | "Real browser automation via Playwright, Google Calendar integration, and a Claude MCP server so ATHENA can be a tool inside other AI systems." |

---

## Time Map

| Minute | Feature | Key Phrase |
|---|---|---|
| 1 | Dashboard | "Not a chatbot — an AI OS" |
| 2 | Multi-agent chat | "Agent badge shows which specialist answered" |
| 3 | Memory | "pgvector embeddings, not keyword search" |
| 4 | Life OS | "RLS — every user sees only their data" |
| 5 | Knowledge graph | "Auto-built from conversations" |
| 6 | Documents RAG | "PyMuPDF → chunks → embeddings → LLM" |
| 7 | Voice + Insights | "Hands-free loop, real analytics" |
| 8 | Report + Deploy | "Zero infra cost, full CI/CD" |
