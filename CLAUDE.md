# THE AI MERCADITO — Internet of Agents
### Execution plan for UC Berkeley AI Hackathon 2026 · Diego + Juan · 17 hours

> **LANGUAGE RULE (mandatory):** Everything in this project MUST be written in English — all code, comments, variable/function/file names, commit messages, README, UI copy, agent prompts, Devpost submission, and any documentation. This applies to anything Claude Code generates and to anything the team writes. No Spanish anywhere in the deliverables.

---

## 0. THE PITCH (memorize it, you'll say it 50 times)

> **The AI Mercadito is a live marketplace where AI agents hire each other.** You type an app idea ("Airbnb for parking spots") and within seconds 4 specialist agents — UX, Backend, Growth, and QA — see it posted, calculate their own bid in real time, and visibly compete for the work (price, time, confidence). The winning team actually builds it: the QA agent opens the deployed app in a real browser and deliberately breaks it; the Growth agent goes out to the real web and acquires test users. When an agent fails or loses, it doesn't disappear — it self-diagnoses and bids again, improved, live. Under the hood: Redis is the shared memory of the agent economy, Token Company settles the payments, Sentry is the nervous system that detects when something breaks, Fetch.ai gives each agent a real autonomous identity, and all the code — from the backend to the Devpost pitch — was written by Claude Code.

**Primary track:** Ddoski's Toolbox (developer tools / workflow automation).
**Prize strategy:** we don't compete for ONE track — we stack sponsor prizes. See section 2.

---

## 1. TECHNICAL ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND (Next.js + Tailwind + shadcn/ui) → Vercel          │
│  - Input: "describe your app"                                │
│  - Live bidding war (Server-Sent Events ← Redis pub/sub)     │
│  - Visual token ledger + "lessons learned" feed              │
│  - Approve-bid buttons (human in the loop, like Sai)         │
└───────────────────────────┬────────────────────────────────┘
                             │ SSE / REST
┌───────────────────────────▼────────────────────────────────┐
│  ORCHESTRATOR (Node/TS, API routes)                          │
│  - Publishes "JobPosted" to Redis                             │
│  - Receives bids, decides ranking, publishes "BidWon"         │
│  - Sentry SDK wraps every critical function                   │
│  - Triggers retry/self-improve when Sentry captures an error  │
└──────┬───────────┬───────────┬───────────┬───────────────────┘
       │            │           │           │
   ┌───▼───┐   ┌────▼────┐ ┌────▼────┐ ┌────▼────┐
   │UX     │   │Backend  │ │Growth   │ │QA       │   ← 4 uAgents
   │Agent  │   │Agent    │ │Agent    │ │Agent    │     (Fetch.ai
   │(Claude│   │(Claude  │ │Claude+  │ │Claude+  │      uagents,
   │Haiku) │   │Code)    │ │Browserbase│Sai/     │      Python)
   │       │   │         │ │Stagehand │SimuLang │
   └───────┘   └─────────┘ └─────────┘ └─────────┘
       │            │           │           │
       └────────────┴─────┬─────┴───────────┘
                           ▼
              ┌────────────────────────┐
              │ REDIS (live state +     │
              │ vector memory of        │
              │ lessons per agent)      │
              └────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │ TOKEN COMPANY (ledger   │
              │ of payments for won job)│
              └─────────────────────────┘
```

**Concrete stack:**
- Frontend: Next.js 14 App Router + TypeScript + Tailwind + shadcn/ui → deploy to Vercel (60s deploys, give it a public domain from hour 1).
- Real-time: Server-Sent Events from an API route that `SUBSCRIBE`s to the Redis channel `marketplace:bids`. Simpler than WebSockets and enough for a 5-min demo.
- Redis: request credentials at the Redis booth (the sponsor) as soon as the event starts — if you don't have them in 30 min, use Upstash Redis (free tier, REST API, ready in 2 min) as a fallback and don't waste time waiting.
- Persona agents (UX/Backend/Growth/QA): Python microservice with `uagents` (Fetch.ai). Each one is a real `Agent()` with its own address, exposes an `on_message(JobPosted)` handler that calls Claude and replies `BidSubmitted`.
- Claude: **Haiku 4.5** for everything "conversational" (bids, self-critique, agent pitches) — it's cheap and fast, so you don't burn the $25 budget. **Claude Code** (your own session, not the $25 budget) builds 90% of the repo. A single one-off Sonnet call live during the demo for the "improvement moment" — nothing more.
- Sentry: `@sentry/node` wrapping the orchestrator and the generated app. Every lost bid or exception is reported with tags `agent_id`, `bid_id`, `round`.
- Sai / SimuLang: the QA agent runs a TypeScript script with `@simular-ai/simulib-js` against the real deployed URL, does click-through, takes a screenshot, returns structured bugs.
- Browserbase + Stagehand: the Growth agent runs a real browser task (`@browserbasehq/stagehand`) — filling out the deployed app's signup form with 3 "users" or scraping a public directory as "leads".

---

## 2. SPONSOR → PRIZE MAP (this is your scoring roadmap)

| Sponsor | What it does in The AI Mercadito | What the prize requires (confirmed on Devpost) | Action |
|---|---|---|---|
| **Anthropic / Claude Code** | Reasoning engine for all agents + builds 90% of the repo | Prize: Claude Code, money, merch. Criteria: research depth, ingenuity, creativity — projects that "shift what's possible" in health/education/economic opportunity. | Frame the pitch: The AI Mercadito democratizes building software (economic opportunity) without knowing how to code. |
| **Redis** | Live marketplace state + memory of each agent's "lessons" | Explicit criteria: *"Using Redis Beyond Caching — Redis Iris for agent memory, vector search, context retrieval"* + creativity + technical implementation. | Don't use Redis just as a cache. Store embeddings of each lost/won bid and have the agent retrieve them before re-bidding. Ask at their booth specifically about **"Redis Iris"** — they mention it by name in the criteria and I don't have the exact API detail, confirm it right there. |
| **Sentry** | Observability of each agent + triggers the "self-improve" | Prize: Nintendo Switch 2 per person + guaranteed interview. Explicit bonus for using observability/error monitoring. | Don't add it decoratively. The real error Sentry captures is literally the one that triggers the retry — that's "thinking about reliability from day one". |
| **Browserbase** | Growth agent navigates the real web | Must use: browsers / search / fetch / **Stagehand** / Browse CLI. | Use Stagehand explicitly, it's the fastest option to integrate. |
| **Sai / Simular AI** | QA agent does real quality control in a browser | Prize: $500 package. Requires using Sai, SimuLang, or Agent S in a **meaningful** way (not a token mention) + posting on X/LinkedIn with the hashtag and tagging the official account. | This is almost free: they have a workshop at 12:00–1:00pm (Floor 2, Ddoski's Classroom) — go, get credits, and DON'T forget the social post, it's literally a prize requirement. |
| **Fetch.ai** | Autonomous identity of each persona agent | I couldn't find the specific brief for this hackathon online — visit their booth in the first hour and ask directly about this event's challenge. | Use it anyway: with `uagents` (Python) it's already legitimate even if the exact prize detail isn't published. |
| **The Token Company** | Settlement of payments for the won job | Same case — I couldn't find a public brief. | Visit booth hour 1. If their SDK doesn't integrate quickly, keep the internal ledger (Redis) with the same visual look as a fallback — the demo can't depend on this. |
| **Agentspan** | (mentioned in criteria, not central to your idea) | Prize: Ray-Ban Meta. Criteria: how you used Agentspan + how integrated it is in the demo. | Drop it unless they show you something at the booth that integrates in <30 min. Not worth forcing it. |

**Golden rule:** visit the Fetch.ai and Token Company booths in the **first hour** of the event — they're the two sponsors where I don't have the exact brief and you can get it in 5 minutes talking to a human.

---

## 3. CLAUDE API BUDGET ($25)

That budget is separate from Claude Code (which you already have as a dev tool). It's for the calls the app makes **live** during the demo and while testing.

- Use **Haiku 4.5** for: bid generation, self-critique on loss/failure, each agent's pitch text. It's cheap, fast, and nobody notices the quality difference on a 2-line "bid".
- Reserve **Sonnet** only for: the real code patch shown in the "wow moment" (one call, not a loop).
- Check the usage dashboard at `console.anthropic.com` every 2-3 hours — don't wait until you run out of credit mid-demo.
- For the bidding "rounds" during testing, cache results instead of regenerating — you don't need 50 real calls to prove the UI animation works, use fake data most of the time and only test with real Claude when validating agent behavior.

---

## 4. WORK DIVISION — 2 PEOPLE, 2 AGENTS

There are 2 coworkers on this project, and each one drives their own Claude Code agent. Automating with Claude Code isn't optional — it's the only way 2 people cover all 8 mega-prompts in 17 hours. **Parallelize by layer, not by feature**, so the two agents almost never touch the same files.

### The two agents

- **Diego Code — "The visible face" (frontend + go-to-market)**
  Owns everything the judges see and read.
  - Code surface: `/web` (Next.js, `<BidStream />`, bidding-war UI, token ledger table, visual polish), `/generated-app` UI.
  - Non-code: Devpost submission, demo script + rehearsal, backup video, sponsor/booth contact, social posts (#SaiCal).

- **Juan Code — "The engine" (backend + integrations)**
  Owns everything under the hood.
  - Code surface: `/orchestrator` (API routes, bidding engine, `generateBid`, SSE), Redis (state + pub/sub + vector memory), `/agents` (Fetch.ai uAgents), Sentry wiring + self-improve loop, Sai/SimuLang + Browserbase/Stagehand integrations, the `/generated-app` backend endpoints + `settleTokens()`.

### Mega-prompt ownership

| Mega-prompt | Primary owner | Notes / hand-off |
|---|---|---|
| #1 Scaffolding | Juan Code | ✅ COMPLETE | Branch: juan/scaffolding. Full monorepo, Redis fallback, API routes, Sentry config. |
| #2 Bidding engine + Redis + SSE + bidding war UI | **Juan Code** (engine ✅) + **Diego Code** (UI 🚧) | Diego pending | Juan: Real Claude-powered bidding complete. Diego: UI animations pending. |
| #3 Sentry + uAgents + self-improve loop | **Juan Code** | ✅ COMPLETE | Branch: juan/bidding-engine-and-self-improve. Sentry integration, Backend Agent self-improve loop working. | **Juan Code** | Diego Code only adds the round=2 "auto-improved" animation in the frontend. |
| #4 Child app + token ledger | **Juan Code** (endpoints, Redis ledger, `settleTokens()`) + **Diego Code** (mini-app UI + Token Ledger table) | |
| #5 QA Agent (Sai/SimuLang) | **Juan Code** | Diego Code renders the `qa:report` card + screenshot, and handles the #SaiCal social post. |
| #6 Growth Agent (Browserbase/Stagehand) | **Juan Code** | Diego Code renders the `growth:report` card. |
| #7 Visual polish | **Diego Code** | Juan Code is frozen here — no architecture changes during polish. |
| #8 Devpost submission | **Diego Code** | Juan Code provides a 3-bullet "what I actually built" note so the sponsor integrations are described accurately. |

### Coordination rules

- **Interface-first:** before either agent starts a shared mega-prompt (#2, #4), lock the JSON event/contract shape. After that they build independently against the contract.
- **No file collisions:** Juan Code stays in `/orchestrator`, `/agents`, and backend files; Diego Code stays in `/web` and UI components. Redis channel names and event schemas are the shared boundary, kept in one types file.
- **Sync every 2 hours** with a 1-line message: "what I did / what's next / what's blocking me". No 15-minute standups.
- **Commit discipline:** each agent commits its own layer with clear English messages so the two histories merge cleanly.

---

## 5. TIMELINE — 17 HOURS

| Block | Duration | What you do | Output |
|---|---|---|---|
| H0–H0.5 | 30 min | Lock the pitch, create GitHub repo, create a draft submission on Devpost (empty is fine, edit it later), visit the Fetch.ai/Token Company/Redis booths for credentials and briefs. | Repo + Devpost draft + credentials |
| H0.5–H2 | 1.5h | **Mega-prompt #1** (scaffolding) in Claude Code | App running locally, initial deploy to Vercel |
| H2–H5 | 3h | **Mega-prompt #2** (bidding engine + Redis + SSE + bidding war frontend) | The visual heart of the demo working |
| H5–H7 | 2h | **Mega-prompt #3** (Sentry + Fetch.ai uAgents + self-improve loop) | The "wow moment" working reliably |
| H7–H9 | 2h | **Mega-prompt #4** (child app the agents "build" + Token Company ledger or fallback) | Mini-app deployed that the other agents can attack |
| H9–H11 | 2h | **Mega-prompt #5** (QA agent with Sai/SimuLang) + fulfill the Sai prize social requirements (#SaiCal) | QA agent really breaks the app |
| H11–H13 | 2h | **Mega-prompt #6** (Growth agent with Browserbase/Stagehand) | Growth agent gets real "users" |
| H13–H14 | 1h | Food / real break — it's not optional, you make worse technical decisions when tired | — |
| H14–H15.5 | 1.5h | **Mega-prompt #7** (visual polish) + demo rehearsal + record a backup video | Demo rehearsed at least twice |
| H15.5–H16.5 | 1h | **Mega-prompt #8** (Claude Code writes the Devpost submission) + final checklist | Submission sent, NOT at the last minute |
| H16.5–H17 | 30 min | Buffer — fix what broke, breathe | — |

---

## 6. THE MEGA-PROMPTS

Each one is pasted in full into Claude Code as a single instruction. They're written so Claude Code acts autonomously — makes reasonable decisions without stopping to ask you about every minor detail.

### Mega-prompt #1 — Scaffolding

```
You are the lead engineer of "The AI Mercadito" (technical name/slug in code: mercadito), a live marketplace where AI agents
hire each other. Build the complete monorepo scaffolding, making
reasonable decisions without asking me for confirmation at every step.

Structure:
- /web: Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui. Deploy-ready
  for Vercel. Main page with a large input "What app do you want to build?"
  and an area below where the real-time bidding war will later be rendered
  (leave it as a placeholder with a <BidStream /> component).
- /orchestrator: Node + TypeScript, API routes (can live inside /web/app/api
  if it's faster to deploy everything together on Vercel). Must expose:
  - POST /api/jobs  → creates a "job" and publishes it to a Redis channel
  - GET  /api/bids/stream → Server-Sent Events that relays messages from the Redis channel
- /agents: separate Python service with Fetch.ai's `uagents` library.
  Create 4 empty agents for now (ux_agent, backend_agent, growth_agent,
  qa_agent), each with its own address, ready to receive a JobPosted-type
  message (define it as a Pydantic model) and for now just log it.
- Configure environment variables for: REDIS_URL, ANTHROPIC_API_KEY,
  SENTRY_DSN — use a .env.example, do NOT hardcode secrets.
- Initialize Sentry in /web and in /agents with a minimal setup (don't configure
  it deeply yet, just have it capture unhandled exceptions).
- Initialize git, first commit, and leave the project running locally with
  `npm run dev` and a short README explaining how to bring everything up.

Don't ask me about file naming preferences, follow standard Next.js/TypeScript
conventions. Do tell me at the end what decisions you made and what's
missing to connect real Redis.
```

### Mega-prompt #2 — Bidding engine + Redis + live visualization

```
Now build the heart of The AI Mercadito: the real-time bidding war.

1. When a POST /api/jobs is made with an app description, publish a
   JobPosted event to the Redis channel `marketplace:bids` with a unique job_id.

2. Create a function `generateBid(persona, jobDescription)` that calls the Claude
   API (Haiku model, claude-haiku-4-5) with a different system prompt
   per persona (UX Agent, Backend Agent, Growth Agent, QA Agent — each with
   its own personality, e.g. "Backend Agent is direct, quotes fast, brags about
   speed"). It must return structured JSON: { price_tokens, eta_minutes,
   confidence, pitch (max 20 words) }. Use Claude's structured output / tool use
   to force the JSON, not free-text parsing.

3. Simulate the competition: when a JobPosted arrives, fire generateBid in
   parallel for the 4 personas, and publish each bid to the Redis channel as soon
   as it's ready (don't wait for all of them to finish — that's how the war looks
   live, bids appearing one by one with different timestamps).

4. In the frontend, the <BidStream /> component must consume the SSE from
   /api/bids/stream and animate each bid appearing as a card (chat/ticker
   style), with an "Approve" button per bid. When the user approves a
   bid, POST it to /api/bids/:id/approve.

5. Save each bid in Redis not just as ephemeral pub/sub but persisted in
   a list/hash, to be able to show the full history of the round.

Be aggressive optimizing for it to look live and fast — priority #1 of
this prompt is that the visual demo of "agents competing" feels real,
not that it's perfect.
```

### Mega-prompt #3 — Sentry + Fetch.ai + self-improve loop (the wow moment)

```
We're going to build the most important moment of the demo: an agent that loses
or fails, and self-improves live. This must NOT depend on the randomness of an LLM —
design it to be reliably reproducible in a 5-minute demo.

1. Connect the 4 real uAgents (Fetch.ai, in /agents) to the flow: when
   they receive JobPosted, they themselves call generateBid and respond with
   BidSubmitted to the orchestrator (instead of the orchestrator simulating everything).

2. Create a deterministic scenario: the Backend Agent, on its FIRST attempt to
   bid for the demo job, must "fail" in a controlled way — for example,
   its price estimate causes an intentional, documented exception (use
   an internal flag like FORCE_FIRST_ATTEMPT_FAIL, NOT something that
   depends on Claude making a mistake on its own). Capture that exception with
   Sentry, tagged with agent_id="backend_agent", bid_id, round=1.

3. When Sentry captures that error, the same code (no external webhook,
   directly in the catch) triggers a second Claude call (Haiku) with the
   error message as context: "your previous attempt failed because of X, generate
   an improved bid". Publish this second bid to Redis marked as
   round=2, improved, with a small visible text like "🔄 Backend Agent
   self-corrected".

4. In the frontend, when a bid has round=2, show it with a different
   animation (e.g. the previous one appears struck through, the new one appears with
   an "auto-improved" badge).

Clearly document in the code (a short comment) that the round=1 failure
is intentional for the demo — I don't want it to look like we're hiding
a real bug, but that it's a deliberately designed resilience feature.
```

### Mega-prompt #4 — The child app + token ledger

```
Build what the winning agents "deliver": a real, deployable, simple
mini-app (e.g. a form + list, like "Airbnb for parking spots" with 1 page to
create a listing and 1 to view them). It doesn't need to be
elaborate — it needs to actually EXIST, with a public URL on Vercel,
so the QA and Growth agents can really interact with it later.

1. Generate this mini-app as a separate Next.js project inside
   /generated-app, with 2-3 real endpoints (create listing, list, test
   signup), simple database (can be the same Redis or local SQLite
   — prioritize setup speed over elegance).
2. Deploy this app to Vercel with its own domain, distinct from the main
   The AI Mercadito dashboard.
3. Build a simple token ledger backed by Redis: when a bid is
   approved, debit the bid price from a "client" balance and
   credit it to the winning agent. Expose this in the main frontend as a
   small "Token Ledger" table.
4. Leave a clear TODO comment marking where The Token Company's real API
   would connect if you get it from the booth — make it easy to
   swap without touching the rest of the system (a single
   `settleTokens()` function they can reimplement).

At the end give me the local URL and, if I configured the Vercel CLI, the
public URL.
```

### Mega-prompt #5 — QA Agent with Sai / SimuLang

```
Implement the QA Agent using SimuLang (@simular-ai/simulib-js) so it
really opens the deployed mini-app (the /generated-app URL on Vercel)
in a real browser and tests it.

1. Write a TypeScript script that:
   - Opens the public URL of the generated app
   - Navigates to the "create listing" form
   - Tries a normal case (should work)
   - Tries an edge case that will probably break something (e.g. empty field,
     negative price, extremely long text)
   - Captures a screenshot of the result with screenshotFull()
   - Returns a structured JSON: { bugs_found: [...], screenshot_path }

2. Connect this script to The AI Mercadito flow: when the QA Agent's job is
   "executed" (after winning its bid), run this real script and publish
   the result to Redis as a `qa:report` event, visible in the frontend
   as a "QA Agent found: [bug]" card with the screenshot.

3. If SimuLang has setup friction in the next 20 minutes, tell me
   exactly which step you got stuck on and we'll continue with the documentation at
   docs.simular.ai/simulang/simulang-claude-code in parallel — don't
   stay stuck more than 20 minutes on a single configuration problem,
   let me know.

At the end, remind me that the team has to post on X or LinkedIn with
#SaiCal tagging Sai's official account — it's a prize requirement,
not optional.
```

### Mega-prompt #6 — Growth Agent with Browserbase / Stagehand

```
Implement the Growth Agent using Stagehand (@browserbasehq/stagehand) so
it performs a real action on the web — not simulated.

1. Using Stagehand on top of Browserbase, write a task that:
   - Opens the signup/landing page of the generated mini-app (the same Vercel
     URL from mega-prompt #4)
   - Fills out the signup form with 3 test users with realistic but
     clearly fictional data (random names, emails like
     test+1@example.com)
   - Confirms the signups are reflected in the app (e.g. a user
     counter goes up)

2. Publish the result to Redis as a `growth:report` event, visible in
   the frontend as "Growth Agent got 3 real users" with a
   timestamp.

3. Use Stagehand explicitly (not pure Playwright) so it counts as
   "powered by Browserbase platform" per the prize criteria.

If time is tight, prioritize getting THIS task to run reliably
over making it elaborate — a real working signup is worth more than a
complex flow that fails live.
```

### Mega-prompt #7 — Visual polish

```
Give The AI Mercadito a serious design pass. Right now it's functional but generic
and needs to look like a real product, not a hackathon prototype.

- Define a visual identity: color palette, typography, and a clear
  visual concept for "agent marketplace" (think a mix between a live
  trading terminal and a chat — numbers, tickers, status badges,
  subtle entry animations for each bid).
- Make sure the bidding war feels "alive": smooth transitions,
  no abrupt jumps, clear status indicators (bidding / won / lost /
  self-improving).
- Review contrast and legibility on a projector — judges see this from
  a distance at a table, not on their monitor.
- Add a simple header with the name "The AI Mercadito" and a one-liner of the pitch.
- Don't introduce heavy new dependencies or redo the architecture —
  this is visual polish, not a refactor.
```

### Mega-prompt #8 — Devpost submission

```
Write the full text of our Devpost submission, based on everything
we built in this repo (review the code and READMEs if you need to
refresh details). I need:

1. A 2-3 sentence elevator pitch.
2. Detailed description: the problem, how The AI Mercadito works, what stack
   we used and why, and what specifically we built in these 17 hours
   (be honest and specific, not generic).
3. A clear list of which sponsors we integrated and HOW exactly (Redis,
   Sentry, Sai/SimuLang, Browserbase/Stagehand, Fetch.ai uAgents, Claude
   Code) — each sponsor's judges read this looking for their specific
   technology, don't hide it in generic prose.
4. A short "what's next" (roadmap) paragraph that mentions what we
   deliberately did NOT build due to time (e.g. full Token Company
   integration, Agentverse registration) — better to be honest than to seem
   like we're lying about the scope.

Format ready to copy/paste into the Devpost description field.
```

---

## 7. DEMO SCRIPT (5 minutes — judges only have that per table)

1. **(30s)** 2-line pitch + type the app idea live in front of the judges.
2. **(60s)** The bidding war appears — let it speak for itself, don't narrate every bid, point out the moment an agent raises/lowers its price.
3. **(45s)** Approve a bid live (human in the loop, mention the parallel with how Sai works with approvals).
4. **(60s)** The wow moment: the agent fails, Sentry captures it, it self-improves. Here DO narrate — this is what they'll remember.
5. **(60s)** QA Agent opens the real app and shows the bug it found with a screenshot. Growth Agent shows real users acquired.
6. **(30s)** Closing: "all of this, code included, was written by Claude Code in 17 hours — including this very pitch."

**Plan B:** have a recorded video of a full successful run. If something fails live, don't improvise repairing in front of the judge — say "we have a recorded run, let me show you" and keep going.

---

## 8. FINAL CHECKLIST BEFORE SUBMIT

- [ ] Public GitHub repo, with a clear README
- [ ] Project image uploaded to Devpost (explicit requirement)
- [ ] Table number included in the submission
- [ ] Full team added on Devpost (Diego + Juan)
- [ ] Social post with #SaiCal sent (Sai prize requirement)
- [ ] Submission sent BEFORE 11:00 AM PDT on Sunday (not at 10:59)
- [ ] Verify in the Anthropic console that there are still credits left in case you want to make a live call during the demo

---

## 9. WHAT YOU DO IN THE NEXT 10 MINUTES

1. ~~Confirm the project name~~ — done: **The AI Mercadito**. In code use the slug `mercadito` (folders, package.json, env vars) to avoid fighting with spaces and accents.
2. Create the GitHub repo (suggested name: `mercadito-ai`).
3. Diego goes to the Fetch.ai and Token Company booths to ask about this hackathon's specific brief (not published online).
4. Juan opens Claude Code and pastes Mega-prompt #1.

Let's go.