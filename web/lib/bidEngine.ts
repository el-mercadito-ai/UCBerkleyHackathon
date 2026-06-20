import type { Bid, AgentRole, JobPosted, JobAwarded, LedgerEntry } from "./types";

// =============================================================================
// SCAFFOLDING-LEVEL bidding engine.
// This produces simulated bids so the realtime pipe (job -> bids -> award ->
// ledger) is demonstrably alive end-to-end without the Python uAgents running.
//
//   - Mega-prompt #2 (Juan): replace simulateBids() with the real engine that
//     asks the Fetch.ai uAgents for bids (the agents call Claude to write pitches).
//   - Mega-prompt #3 (Juan): the round=2 self-improve loop hooks in here.
//   - Mega-prompt #4 (Juan): settleTokens() lives here.
// The frontend (Diego) only consumes the events; it never imports this file.
// =============================================================================

const AGENTS: { id: string; role: AgentRole; flavor: string }[] = [
  { id: "ux_agent", role: "ux", flavor: "I'll make it beautiful and on-brand in record time." },
  { id: "backend_agent", role: "backend", flavor: "Rock-solid APIs, Redis ledger, zero downtime." },
  { id: "growth_agent", role: "growth", flavor: "I'll get you real users on day one." },
  { id: "qa_agent", role: "qa", flavor: "Nothing ships until I've clicked every button." },
];

function makeBid(job: JobPosted, a: { id: string; role: AgentRole; flavor: string }, round: number): Bid {
  // Deterministic-ish pseudo-random so the demo feels alive but stable.
  const seed = (job.job_id.length + a.id.length + round) % 7;
  return {
    bid_id: newId("bid"),
    job_id: job.job_id,
    agent_id: a.id,
    agent_role: a.role,
    price_tokens: 40 + seed * 7 - (round - 1) * 5, // round 2 undercuts a bit
    eta_minutes: 15 + seed * 3,
    confidence: Math.min(0.99, 0.55 + seed * 0.05 + (round - 1) * 0.15),
    pitch: round === 1 ? a.flavor : a.flavor + " (auto-improved after self-diagnosis)",
    round,
    created_at: nowIso(),
  };
}

/** Fire simulated bids onto the bus with small delays so they animate in. */
export async function simulateBids(job: JobPosted): Promise<void> {
  AGENTS.forEach((a, i) => {
    setTimeout(() => {
      publishEvent({ type: "bid.created", data: makeBid(job, a, 1) }).catch(() => {});
    }, 400 + i * 600);
  });

  // After all round-1 bids, award the most confident and settle tokens.
  setTimeout(() => {
    const bids = AGENTS.map((a) => makeBid(job, a, 1));
    const winner = bids.reduce((best, b) => (b.confidence > best.confidence ? b : best));
    const awarded: JobAwarded = {
      job_id: job.job_id,
      winning_bid_id: winner.bid_id,
      agent_id: winner.agent_id,
      price_tokens: winner.price_tokens,
      created_at: nowIso(),
    };
    publishEvent({ type: "job.awarded", data: awarded }).catch(() => {});
    settleTokens(awarded).catch(() => {});
  }, 400 + AGENTS.length * 600 + 800);
}

/**
 * settleTokens() — Mega-prompt #4 ownership (Juan).
 * SCAFFOLDING: writes a single ledger entry to the bus. Real version persists
 * to the Redis token ledger and (TODO) calls The Token Company API.
 */
export async function settleTokens(awarded: JobAwarded): Promise<LedgerEntry> {
  const entry: LedgerEntry = {
    entry_id: newId("led"),
    job_id: awarded.job_id,
    from: "buyer",
    to: awarded.agent_id,
    amount_tokens: awarded.price_tokens,
    reason: "Job awarded — payment settled",
    created_at: nowIso(),
  };
  // TODO(token-company): POST to The Token Company settlement API here.
  await publishEvent({ type: "ledger.entry", data: entry });
  return entry;
}
