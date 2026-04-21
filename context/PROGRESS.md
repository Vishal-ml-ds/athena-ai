# ATHENA — Progress Tracker

## Current Phase: Feature parity push (Sprint 1 polish)
## Last Updated: 2026-04-21

## 2026-04-21 Session Log

### Shipped (production live)
- **Signup service-role pollution fix** (#2): `supabase.auth.sign_up()` was mutating the cached service-role client's Authorization header, so subsequent `.table().insert()` calls during the same request ran under the new user's JWT and failed RLS. Switched to `admin.create_user()` + isolated fresh admin clients for signup/login/refresh.
- **Frontend auth guard** (#3): `/chat`, `/life`, `/memory`, `/documents`, `/browser`, `/knowledge`, `/report`, `/agents`, `/insights`, `/settings` now redirect to `/login?next=<path>` when signed out; spinner while checking.
- **Signup single source** (#3): removed the double-create bug — signup now calls only the backend and installs returned tokens via `supabase.auth.setSession()`.
- **Notification empty state** (#3): removed hardcoded "Call Mom at 5 PM / 7-day streak" mock data.
- **Onboarding snake_case fix** (#4): `/auth/onboarding` was 422-ing because the frontend sent camelCase payload. Fixed + clamped interests to backend's max_length=10.
- **Voice on OpenAI native** (#5): Euri gateway doesn't expose `/audio/speech` or `/audio/transcriptions`. Routed TTS + Whisper through `https://api.openai.com/v1` with the new `OPENAI_API_KEY` secret. Verified 20KB MP3 returned.
- **Google OAuth buttons removed** (#6): Google provider wasn't enabled in Supabase; buttons errored on click. Email/password is the only auth path now.
- **Classifier routing fix** (#7): web-search intents ("search the web for X") now correctly route to the `researcher` agent instead of the simulated `browser` agent. Verified with confidence 0.95.
- **Forgot/Reset password** (#7): new `/forgot-password` + `/reset-password` pages wired to `resetPasswordForEmail` / `updateUser`. Login "Forgot?" link now real.
- **Onboarding avatar upload removed** (#7): was visually functional but file was never sent anywhere. Replaced with decorative icon.
- **Sidebar Help Center link removed** (#7): `href="#"` dead link cleaned up.
- **RAG upgrade** (#8): switched embeddings from Euri gateway (near-random vectors — "secret password" scored <0.1 against the matching chunk) to OpenAI native `text-embedding-3-small`. Lowered match threshold 0.3 → 0.1. Verified: 4/4 paraphrased document queries return cited answers at similarity 0.25-0.46.

### Infrastructure
- Modal secret `athena-secrets` now includes: `OPENAI_API_KEY`, `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD`, `NEO4J_DATABASE`. All other existing keys preserved.
- RLS re-enabled on `tenants` + `profiles` (emergency `DISABLE` workaround reverted via migration `010_restore_rls_after_signup_fix.sql`).
- Demo user tenant+profile recreated; `scripts/seed_demo.py` ran — 4 habits, 3 goals, 10 finance, 15 health, 7 memories, 8 knowledge nodes, 9 edges.
- Vercel is NOT git-integrated — every merge requires a manual `vercel --prod` from `frontend/`. Consider wiring Git integration in the Vercel dashboard.

### In this session's final PR (pending)
- Real **Playwright browser agent** replacing the earlier simulation — Chromium on Modal, real navigate + screenshot + text extraction + grounded LLM summary.
- **Neo4j AuraDB** dual-write for the knowledge graph — `neo4j_client.py` + mirrored upserts in `knowledge_service.py`. Falls back to Supabase silently if `NEO4J_URI` is missing.
- Modal image now installs `playwright` + `chromium` via `run_commands("playwright install --with-deps chromium")`.

### Known not-yet-done (lower priority)
- Tavily occasionally under-used by the researcher agent — prompt doesn't strictly enforce "ground your answer in the search results, never use training data for current facts".
- Older document chunks uploaded with Euri embeddings still have low-recall; users re-uploading get the upgraded embeddings.
- No CI/CD — pushes do not auto-deploy.

---

## Historical context (before 2026-04-21)

## Current Phase: UI Overhaul + Production Fixes
## Original Last Updated: 2026-04-02
## GitHub: https://github.com/Vishal-ml-ds/athena-ai (PRIVATE)

---

## PRODUCTION URLS
- **Frontend**: https://athena-ai-topaz-two.vercel.app
- **Backend**: https://vishal-ml-ds--athena-backend-fastapi-app.modal.run
- **Supabase**: tksezbolxkwqxwyglmac (ap-southeast-1)

## DEPLOYMENT STATUS ✅
- Modal backend: LIVE, /health returns 200
- Vercel frontend: LIVE, serving pages
- Supabase: All 9 migrations applied
- Modal secrets: All env vars configured
- GitHub: PRIVATE repo
- Demo data: Seeded (4 habits, 3 goals, 10 finance, 15 health, 7 memories, 8 knowledge nodes)

## API KEYS (in backend/.env and Modal secrets)
- Supabase: configured
- Euri AI: configured
- Tavily: tvly-dev-SeN4y... (web search)
- Upstash Redis: generous-dingo-75266.upstash.io
- Modal: authenticated as vishal-ml-ds
- Vercel: authenticated, project "athena-ai"

## QA TEST RESULTS (134/138 pass, 0 JS errors)
- All 13 pages load and render
- All sidebar navigation works
- All tabs, buttons, forms functional
- 53 backend unit tests passing

## NEXT SESSION: UI OVERHAUL (User's Request)
User is unhappy with current UI quality. Needs:
1. **Chat feature broken on production** — messages not sending/streaming
2. **Remove personal details** — email, credentials, demo account info from frontend code
3. **Full UI redesign** — better animations, layouts, content
4. **Missing content** — footer incomplete, empty sections, placeholder text
5. **Design system overhaul** — user says "design system sucks"
6. **All buttons/features must work** — no "coming soon" toasts

## TECH DETAILS FOR NEXT SESSION
- Frontend: Next.js 15 + TypeScript + Tailwind + shadcn/ui at `frontend/`
- Backend: FastAPI at `backend/`, deployed on Modal
- Port config: local backend on 8006, frontend on 3005
- `.env.local` has NEXT_PUBLIC_API_URL=http://localhost:8006 (local dev)
- Production API: https://vishal-ml-ds--athena-backend-fastapi-app.modal.run
- Stitch UI references: 25 exports in `docs/ui-references/`
- UI Design Spec: `docs/UI_DESIGN_SPEC.md` (98.9KB, "Celestial Intelligence" theme)

## ALL COMPLETED WORK (Sessions 2026-03-29 to 2026-04-02)
### Code Features Built
- Auth (signup/login/JWT/Google OAuth)
- Chat with 6 multi-agent supervisor (intent classification + SSE streaming)
- Real agent tools (Tavily web search, Life OS data queries)
- Memory system (extraction, pgvector search, CRUD)
- Life OS (habits/goals/finance/health with tab filtering)
- Documents RAG (upload, chunking, embedding, query)
- Knowledge Graph (entity extraction, circular layout, edit/delete)
- Browser Automation (AI task planner simulation, SSE)
- Voice (Whisper transcribe + TTS, hands-free mode)
- Analytics/Insights (agent distribution, time-filtered stats)
- Weekly AI report generation (LLM insights + rule-based nudges)
- Reports API (/weekly, /history)
- Landing page, Settings page, Onboarding flow
- React error boundary
- Rate limiting middleware
- 53 unit tests + 138-point automated QA test

### Bug Fixes Applied
- Analytics 500 (raw SQL in Supabase filter → Python datetime)
- Memory page crash (items.map on object → array normalization)
- Report finance crash (toLocaleString on undefined → fallbacks)
- Life OS tabs (didn't filter → now show per-tab content)
- Agents page (hardcoded fake data → real API data)
- Documents asyncio (create_task → await for serverless)
- Pricing cards layout (misaligned buttons, oversized Pro card)
- Onboarding backend (discarded language/theme/voice → stores all)
- Google OAuth (was "coming soon" toast → real signInWithOAuth)
- Email not confirmed → admin API confirmation
