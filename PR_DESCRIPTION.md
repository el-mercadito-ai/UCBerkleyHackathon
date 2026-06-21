## 🛒 THE AI MERCADITO — Complete Scaffolding (Mega-prompt #1)

**Branch:** `juan/scaffolding`  
**Owner:** Juan Code (the engine)  
**Status:** ✅ READY FOR DIEGO

---

### What this PR delivers

The **complete monorepo scaffolding** for THE AI MERCADITO — a live marketplace where AI agents hire each other. This implements everything specified in **Mega-prompt #1** from CLAUDE.md.

**The end-to-end pipe is alive:**
1. POST a job → job.posted event published
2. Simulated bids fire onto the bus with delays
3. A winner is awarded → job.awarded event
4. Tokens are settled → ledger.entry event
5. Frontend consumes all events via SSE and displays them live

**Zero infrastructure required:** the demo runs with ZERO external dependencies (no Redis, no Sentry, no Python) via an in-memory pub/sub fallback.

---

### 📦 What's included

#### Root structure
- `package.json` — npm workspaces (monorepo)
- `.gitignore` — comprehensive Next.js + Python ignore rules
- `.env.example` — environment template
- `README.md` — full docs (architecture, quickstart, decisions, ownership)

#### Web app (`/web`)
**Config:**
- `package.json` — Next.js 14, React 18, TypeScript, Tailwind, ioredis, Sentry, Anthropic SDK
- `next.config.js` — Sentry wrapper (optional, no crash if DSN unset)
- `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`
- `sentry.*.config.ts` — client, server, edge Sentry init

**The contract (shared with Diego):**
- `web/lib/types.ts` — **THE SHARED CONTRACT**: `JobPosted`, `Bid`, `JobAwarded`, `QaReport`, `LedgerEntry`, `MercaditoEvent` union

**The engine (Juan's domain):**
- `web/lib/redis.ts` — Redis client + in-memory pub/sub fallback
- `web/lib/bidEngine.ts` — simulated bidding + `settleTokens()` placeholder
- `web/lib/ids.ts` — ID generation helpers
- `web/app/api/jobs/route.ts` — POST /api/jobs (publish job, kick off bids)
- `web/app/api/bids/stream/route.ts` — GET /api/bids/stream (SSE event stream)
- `web/app/api/health/route.ts` — GET /api/health (Redis status check)

**Frontend skeleton (hand-off to Diego):**
- `web/app/page.tsx` — minimal UI (input + live event feed)
- `web/app/layout.tsx`, `web/app/globals.css` — basic layout + Tailwind
- **NOTE for Diego:** this is a SKELETON. The real bidding-war animations, child-app renderer, token ledger UI, and QA report cards are yours (Mega-prompts #2–#5). Contract you consume: `web/lib/types.ts`.

#### Python agents (`/agents`) — scaffolding placeholder
- `agents/requirements.txt` — uagents, anthropic, redis, sentry
- `agents/models.py` — Python data models (mirror of types.ts)
- `agents/run_all.py` — launcher placeholder (Mega-prompt #3 fills this in)
- `agents/.env.example`

---

### 🎯 Key decisions made

1. **Redis optional (in-memory fallback):** `lib/redis.ts` uses a module-level singleton in-memory pub/sub bus when `REDIS_URL` is not set. This means the demo runs end-to-end with ZERO infrastructure. For real scale / multiple processes, set `REDIS_URL`.

2. **Sentry optional:** Sentry config exists but doesn't crash if `SENTRY_DSN` is unset (local dev friendly).

3. **Simulated bids (scaffolding level):** `lib/bidEngine.ts` currently generates fake bids with small delays so the SSE stream is visibly alive. **Mega-prompt #2 (Juan)** replaces this with the real Claude-powered Fetch.ai uAgents engine.

4. **Python agents not wired yet:** `agents/run_all.py` is a placeholder. **Mega-prompt #3 (Juan)** fills it in with the real uAgents that listen to Redis for `job.posted` events and bid via Claude.

5. **Frontend is a skeleton:** Diego owns the real bidding-war animations, child-app renderer, token ledger table, and QA report cards (**Mega-prompts #2–#5**). This skeleton proves the contract + pipe work.

6. **Language: everything in English** per CLAUDE.md mandatory rule — all code, comments, variable names, commit messages.

---

### 🚀 How to test

```bash
# 1. Install deps
npm install

# 2. Create minimal .env.local in /web (or use in-memory mode)
# No env vars needed for scaffolding test — in-memory fallback is active.

# 3. Run the dev server
npm run dev
# → http://localhost:3000

# 4. Post a job
# Type a prompt, click "Post job"
# → Watch simulated bids appear in the live feed
# → See job.awarded + ledger.entry events after ~3 seconds
```

---

### 📊 Commits

1. **feat: complete monorepo scaffolding (Mega-prompt #1)** — 28 files, full structure
2. **fix: add missing imports in TypeScript files** — import fixes + package-lock

---

### 🤝 Hand-off to Diego

**Diego, you're unblocked!** The `/web` skeleton exists. Your next steps (Mega-prompt #2):

1. **Review the contract:** `web/lib/types.ts` — this is THE shape of events you consume via SSE.
2. **Build the bidding-war UI:** replace the skeleton in `page.tsx` with the real animations (bids sliding in, confidence bars, "bidding war" feel).
3. **Coordinate on the contract:** if you need different fields in `Bid` or `JobAwarded`, open an issue and I'll sync it with the backend + Python models.

**What you DON'T touch (Juan's domain):**
- `/lib/redis.ts`, `/lib/bidEngine.ts`, `/lib/ids.ts`
- `/app/api/*` routes
- `/agents` (Python)

**Communication:** Use PR comments, issues, or commit messages. We coordinate via GitHub, not chat.

---

### ✅ Mega-prompt #1 checklist

- [x] Root monorepo structure (npm workspaces)
- [x] Next.js /web app with TypeScript + Tailwind
- [x] Shared data contract (types.ts)
- [x] Redis client + in-memory pub/sub fallback
- [x] API routes (POST /api/jobs, GET /api/bids/stream SSE, GET /api/health)
- [x] Placeholder bidding engine (simulated bids + settleTokens stub)
- [x] Frontend skeleton (input + live event feed)
- [x] Python agents scaffolding (/agents structure)
- [x] Sentry config (client, server, edge)
- [x] Comprehensive README
- [x] Git init, first commits, feature branch
- [x] Everything in English

---

### 🔜 Next (Juan's roadmap)

**Mega-prompt #2 (Juan part):** Replace `simulateBids()` with the real bidding engine:
- Wire Fetch.ai uAgents (ux_agent, backend_agent, growth_agent, qa_agent)
- Each agent listens to Redis for `job.posted` events
- Each agent calls Claude to generate a pitch + price bid
- Publish `bid.created` events onto the bus (Diego's UI consumes them)

**Mega-prompt #3 (Juan):** Sentry + self-improve loop:
- Sentry captures agent failures
- Losing agents self-diagnose (call Claude: "why did I lose?")
- Round 2 bids fire with improved confidence/price
- Frontend shows "auto-improved" badge (Diego's part)

**Mega-prompt #4 (Juan part):** Token ledger persistence + Token Company API:
- Persist ledger to Redis (not just event bus)
- Expose GET /api/ledger endpoint
- Integrate The Token Company settlement API (when booth gives us the real endpoint)

**Mega-prompt #5 (Juan):** QA Agent (Sai/SimuLang integration):
- The winning `qa_agent` uses Sai to actually CLICK the generated app
- Publishes `qa.report` event with screenshot + pass/fail
- Diego renders it as a card in the frontend

---

**Built for UC Berkeley AI Hackathon 2026 by Juan Code (the engine).**
