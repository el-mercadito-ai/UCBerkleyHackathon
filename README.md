# 🛒 THE AI MERCADITO
### Internet of Agents — UC Berkeley AI Hackathon 2026

**A live marketplace where AI agents hire each other.**

When you post a job ("build me a landing page for my taco truck"), four specialist AI agents (UX, Backend, Growth, QA) bid against each other in real-time. Each agent uses Claude to generate a pitch and self-corrects when it loses. The winning agent gets paid in tokens, the transaction is settled via The Token Company, and Sentry captures every failure along the way.

---

## Architecture

```
┌─────────────┐
│  BUYER      │  POST /api/jobs { prompt }
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────────┐
│  REDIS PUB/SUB (or in-memory)        │ ◀─ "shared memory of the agent economy"
│  channel: mercadito:events           │
└───┬───────────────────────────────┬──┘
    │                               │
    ▼                               ▼
┌──────────────────┐     ┌────────────────────────┐
│ Fetch.ai uAgents │     │ Web (Next.js + SSE)    │
│  • ux_agent      │     │  • GET /api/bids/stream│
│  • backend_agent │     │  • Live bidding war UI │
│  • growth_agent  │     │  • Token ledger        │
│  • qa_agent      │     │  • Generated child app │
└────────┬─────────┘     └────────────────────────┘
         │
         ▼
    ┌────────────────┐
    │ SENTRY         │ ◀─ detects failures, triggers self-improve
    └────────────────┘
```

---

## Quickstart

### 1. Clone and install
```bash
git clone https://github.com/pecezon/UCBerkleyHackathon.git
cd UCBerkleyHackathon
npm install
```

### 2. Configure environment
```bash
# In /web:
cp .env.example .env.local
# Edit .env.local — at minimum set ANTHROPIC_API_KEY=sk-ant-...
# REDIS_URL is optional; falls back to in-memory pub/sub if not set.

# In /agents (Python agents, not yet wired in scaffolding):
cp agents/.env.example agents/.env
# Edit agents/.env
```

### 3. Run the web app
```bash
npm run dev
# → http://localhost:3000
```

The frontend is a **skeleton** (scaffolding-level). It proves the end-to-end pipe works:
- Post a job → simulated bids appear → a winner is awarded → tokens are settled.
- The full bidding-war animations + child-app generator + QA agent UI are coming in Mega-prompts #2–#5.

### 4. (Optional) Run the Python agents
```bash
# Scaffolding: agents are not yet wired. This is a placeholder.
# Real wiring happens in Mega-prompt #3 (Sentry + uAgents + self-improve loop).
npm run agents:install
npm run agents:run
```

---

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router), React, TypeScript, Tailwind |
| Backend | Next.js API routes, ioredis (Redis client) |
| Agents | Fetch.ai uAgents, Claude (Anthropic), Python |
| Realtime | Server-Sent Events (SSE) + Redis pub/sub |
| Monitoring | Sentry (error tracking + session replay) |
| Payments | The Token Company API (placeholder until real keys) |
| QA Agent | Sai (autonomous browser via SimuLang + Browserbase/Stagehand) |

---

## Project structure

```
mercadito/
├── web/                      # Next.js app (Diego owns UI, Juan owns API routes)
│   ├── app/
│   │   ├── api/jobs/         # POST /api/jobs — publish a job
│   │   ├── api/bids/stream/  # GET /api/bids/stream — SSE event stream
│   │   ├── page.tsx          # Main UI (SKELETON — Diego's domain)
│   │   └── layout.tsx
│   ├── lib/
│   │   ├── types.ts          # THE SHARED CONTRACT (Juan ↔ Diego)
│   │   ├── redis.ts          # Redis client + in-memory fallback
│   │   ├── bidEngine.ts      # Bidding engine + settleTokens() (Juan)
│   │   └── ids.ts            # ID + timestamp helpers
│   ├── sentry.*.config.ts    # Sentry config (client, server, edge)
│   └── package.json
├── agents/                   # Fetch.ai uAgents (Juan)
│   ├── models.py             # Python data models (mirror of types.ts)
│   ├── run_all.py            # Launcher (scaffolding placeholder)
│   ├── requirements.txt
│   └── .env.example
├── .gitignore
├── .env.example
├── package.json
├── CLAUDE.md                 # Execution plan + mega-prompts
└── README.md                 # This file
```

---

## Development workflow (per CLAUDE.md)

- **Juan Code** (the engine): owns `/orchestrator` (API routes), `/agents`, Sentry, integrations, token ledger.
- **Diego Code** (the visuals): owns `/web/app/page.tsx` + all frontend UI/animations.
- **Shared contract**: `web/lib/types.ts` (both must agree before building in parallel).
- **Git**: feature branches + PRs (e.g. `juan/scaffolding`), commit frequently in English.
- **Coordination**: PR descriptions, commit messages, issues.

---

## Progress Tracker

| Mega-prompt | Owner | Status | Branch | Notes |
|---|---|---|---|---|
| #1 Scaffolding | Juan | ✅ DONE | `juan/scaffolding` | Complete monorepo, Redis fallback, API routes, frontend skeleton |
| #2 Bidding engine + Redis + SSE + bidding war UI | Juan (engine) ✅ / Diego (UI) 🚧 | 🚧 IN PROGRESS | `juan/bidding-engine-and-self-improve` | Real Claude-powered bidding complete. Diego: UI animations pending |
| #3 Sentry + uAgents + self-improve loop | Juan | ✅ DONE | `juan/bidding-engine-and-self-improve` | Sentry integration, self-improve loop, Python uAgents skeleton |
| #4 Child app + token ledger | Juan (endpoints) + Diego (UI) | 🔜 NEXT | | Token ledger endpoints + UI table |
| #5 QA Agent (Sai/SimuLang) | Juan | 🔜 NEXT | | QA agent clicks generated app, publishes report |
| #6 Browserbase/Stagehand wiring | Juan | 🔜 OPTIONAL | | Fallback to screenshots if not done |
| #7 Fetch.ai booth integration | Juan | ⏸️ TBD | | Depends on booth brief |
| #8 Token Company real API | Juan | ⏸️ TBD | | Depends on booth API docs |

---

## What's working right now

### ✅ Scaffolding (Mega-prompt #1)
- Complete Next.js monorepo with TypeScript + Tailwind
- Redis client with **in-memory fallback** (zero infrastructure needed)
- API routes: POST /api/jobs, GET /api/bids/stream (SSE), GET /api/health
- Frontend skeleton (input + live event feed)
- Sentry config (optional, no crash if unset)

### ✅ Real Bidding Engine (Mega-prompt #2)
- **4 agents (UX, Backend, Growth, QA) use Claude API** to generate competitive bids
- Each agent: custom system prompt → price, ETA, confidence, pitch
- Backend Agent **intentionally bids too high** on round 1 (demonstrates resilience)
- Real-time bidding replaces simulated version

### ✅ Self-Improve Loop (Mega-prompt #3)
- **Sentry integration**: captures agent failures ("the nervous system")
- Backend Agent loses → self-diagnoses via Claude
- **Round 2 bid**: improved price + confidence based on failure reason
- Frontend can show "🔄 auto-improved" badge (Diego's UI task)

### 🚧 In Progress (Diego)
- Bidding war UI animations (bids sliding in, confidence bars)
- "Auto-improved" badge for round=2 bids
- Token ledger table UI
- Child app renderer

---

## What's missing (TODOs by Mega-prompt)


---

## Decisions made in scaffolding

1. **Redis optional**: `lib/redis.ts` falls back to an in-memory pub/sub bus when `REDIS_URL` is not set, so the demo runs with ZERO infrastructure. For real scale / multiple processes, set `REDIS_URL`.
2. **Simulated bids** (scaffolding): `lib/bidEngine.ts` currently generates fake bids with small delays so the SSE stream is visibly alive. Mega-prompt #2 replaces this with the real Claude-powered agents.
3. **Sentry optional**: Sentry config exists but doesn't crash if `SENTRY_DSN` is unset (local dev friendly).
4. **Python agents not wired yet**: `agents/run_all.py` is a placeholder. Mega-prompt #3 fills it in.
5. **Frontend is a skeleton**: Diego owns the real bidding-war animations, child-app renderer, token ledger table, and QA report cards (Mega-prompts #2–#5).
6. **Language: everything in English** (per CLAUDE.md mandatory rule).

---

## How to contribute

- Read `CLAUDE.md` first (the source of truth).
- Respect ownership boundaries (Juan = engine, Diego = UI).
- Commit frequently with clear messages in English.
- Open PRs rather than pushing to main.
- Use PR descriptions to communicate cross-boundary changes.

---

Built for **UC Berkeley AI Hackathon 2026** by Diego + Juan.