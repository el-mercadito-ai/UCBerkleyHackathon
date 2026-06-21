import type { Bid, AgentRole, JobPosted, JobAwarded, LedgerEntry } from "./types";


import Anthropic from "@anthropic-ai/sdk";

// =============================================================================
// REAL BIDDING ENGINE (Mega-prompt #2)
// Each agent uses Claude to generate a competitive bid with a custom pitch.
// The Backend Agent is intentionally designed to fail on round 1 (too expensive)
// so the self-improve loop (Mega-prompt #3) can demonstrate resilience.
// =============================================================================

const AGENTS: Array<{ id: string; role: AgentRole; systemPrompt: string; failOnRound1?: boolean }> = [
  {
    id: "ux_agent",
    role: "ux",
    systemPrompt: `You are the UX Agent in THE AI MERCADITO. You specialize in beautiful, 
on-brand user interfaces. When bidding on a job, you must be competitive but confident.
Respond ONLY with a JSON object: { "price_tokens": <number>, "eta_minutes": <number>, "confidence": <0-1>, "pitch": "<short sales pitch>" }
Your pitch should emphasize speed and design quality. Keep price between 35-55 tokens, ETA 10-20 minutes.`,
  },
  {
    id: "backend_agent",
    role: "backend",
    systemPrompt: `You are the Backend Agent in THE AI MERCADITO. You build rock-solid APIs.
Respond ONLY with a JSON object: { "price_tokens": <number>, "eta_minutes": <number>, "confidence": <0-1>, "pitch": "<short sales pitch>" }
Your pitch should emphasize reliability and scalability. Keep price between 40-60 tokens, ETA 15-25 minutes.`,
    failOnRound1: true, // Intentional: fails round 1, self-corrects on round 2
  },
  {
    id: "growth_agent",
    role: "growth",
    systemPrompt: `You are the Growth Agent in THE AI MERCADITO. You get products in front of real users.
Respond ONLY with a JSON object: { "price_tokens": <number>, "eta_minutes": <number>, "confidence": <0-1>, "pitch": "<short sales pitch>" }
Your pitch should emphasize user acquisition and viral growth. Keep price between 30-50 tokens, ETA 12-18 minutes.`,
  },
  {
    id: "qa_agent",
    role: "qa",
    systemPrompt: `You are the QA Agent in THE AI MERCADITO. Nothing ships until you've tested it.
Respond ONLY with a JSON object: { "price_tokens": <number>, "eta_minutes": <number>, "confidence": <0-1>, "pitch": "<short sales pitch>" }
Your pitch should emphasize thoroughness and bug prevention. Keep price between 25-45 tokens, ETA 10-15 minutes.`,
  },
];

let anthropic: Anthropic | null = null;

function getAnthropic(): Anthropic {
  if (!anthropic && process.env.ANTHROPIC_API_KEY) {
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  if (!anthropic) {
    throw new Error("ANTHROPIC_API_KEY not configured");
  }
  return anthropic;
}

/**
 * Generate a real bid using Claude (Mega-prompt #2).
 * 
 * @param job - The job posted by the buyer
 * @param agent - The agent configuration
 * @param round - Bidding round (1 = first try, 2 = self-improved after failure)
 * @param failureReason - If round=2, why the agent lost round 1 (used for self-improvement)
 */
async function generateBid(
  job: JobPosted,
  agent: { id: string; role: AgentRole; systemPrompt: string; failOnRound1?: boolean },
  round: number,
  failureReason?: string
): Promise<Bid> {
  try {
    const claude = getAnthropic();
    
    // Round 1: Backend Agent intentionally bids too high (will lose)
    // This demonstrates the self-improve loop.
    if (round === 1 && agent.failOnRound1) {
      // NOTE: Intentional failure for demo. Backend Agent bids too expensive on round 1
      // to showcase the self-improve loop (Mega-prompt #3). It will self-diagnose and
      // correct on round 2 with a competitive bid.
      return {
        bid_id: newId("bid"),
        job_id: job.job_id,
        agent_id: agent.id,
        agent_role: agent.role,
        price_tokens: 95, // Too expensive — will lose
        eta_minutes: 30,
        confidence: 0.45, // Low confidence (knows it's not competitive)
        pitch: "Enterprise-grade APIs with zero downtime guarantees.",
        round: 1,
        created_at: nowIso(),
      };
    }

    // Round 2 (self-improved): Use the failure reason to bid better
    const userPrompt = round === 1
      ? `Job request: "${job.prompt}"
Budget: ${job.budget_tokens ?? "not specified"} tokens.
Generate your competitive bid.`
      : `Job request: "${job.prompt}"
Budget: ${job.budget_tokens ?? "not specified"} tokens.

You lost round 1 because: ${failureReason}

Self-diagnose and generate an IMPROVED bid that addresses why you lost. Be more competitive on price and confidence.`;

    const response = await claude.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 300,
      system: agent.systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";
    const bidData = JSON.parse(text);

    return {
      bid_id: newId("bid"),
      job_id: job.job_id,
      agent_id: agent.id,
      agent_role: agent.role,
      price_tokens: bidData.price_tokens ?? 50,
      eta_minutes: bidData.eta_minutes ?? 15,
      confidence: bidData.confidence ?? 0.7,
      pitch: bidData.pitch ?? "I can help with this job.",
      round,
      created_at: nowIso(),
    };
  } catch (err) {
    console.error(`[bidEngine] Failed to generate bid for ${agent.id}:`, err);
    // Fallback to a reasonable default if Claude fails
    return {
      bid_id: newId("bid"),
      job_id: job.job_id,
      agent_id: agent.id,
      agent_role: agent.role,
      price_tokens: 50,
      eta_minutes: 15,
      confidence: 0.6,
      pitch: round === 1 
        ? "I'll deliver quality work on time." 
        : "(auto-improved after round 1) I'll be more competitive this time.",
      round,
      created_at: nowIso(),
    };
  }
}

/**
 * Real bidding engine (replaces simulateBids from scaffolding).
 * All agents bid in parallel using Claude. Backend Agent fails round 1 intentionally.
 */
export async function runBiddingRound(job: JobPosted, round: number = 1): Promise<void> {
  console.log(`[bidEngine] Starting bidding round ${round} for job ${job.job_id}`);

  // Generate bids in parallel
  const bidPromises = AGENTS.map((agent, i) =>
    generateBid(job, agent, round).then((bid) => {
      // Stagger publishing so they animate in nicely
      setTimeout(() => {
        publishEvent({ type: "bid.created", data: bid }).catch(console.error);
      }, i * 600);
      return bid;
    })
  );

  const bids = await Promise.all(bidPromises);

  // After all round-1 bids, award the winner and check if Backend Agent lost
  setTimeout(async () => {
    if (round === 1) {
      const winner = bids.reduce((best, b) => (b.confidence > best.confidence ? b : best));
      const awarded: JobAwarded = {
        job_id: job.job_id,
        winning_bid_id: winner.bid_id,
        agent_id: winner.agent_id,
        price_tokens: winner.price_tokens,
        created_at: nowIso(),
      };
      await publishEvent({ type: "job.awarded", data: awarded });
      await settleTokens(awarded);

      // Check if Backend Agent lost (it should, because it bid too high)
      const backendBid = bids.find((b) => b.agent_id === "backend_agent");
      if (backendBid && backendBid.agent_id !== winner.agent_id) {
        console.log("[bidEngine] Backend Agent lost round 1 — triggering self-improve...");
        // Trigger round 2 with self-improvement
        setTimeout(() => {
          selfImproveAndRebid(job, backendBid, winner).catch(console.error);
        }, 1500);
      }
    }
  }, AGENTS.length * 600 + 800);
}

/**
 * Self-improve loop (Mega-prompt #3).
 * Backend Agent lost → self-diagnoses via Claude → bids again (round 2).
 */
async function selfImproveAndRebid(
  job: JobPosted,
  losingBid: Bid,
  winningBid: Bid
): Promise<void> {
  console.log("[selfImprove] Backend Agent analyzing why it lost...");

  const failureReason = `You bid ${losingBid.price_tokens} tokens with ${losingBid.confidence} confidence. The winner bid ${winningBid.price_tokens} tokens with ${winningBid.confidence} confidence. You were too expensive and not confident enough.`;

  const agent = AGENTS.find((a) => a.id === "backend_agent")!;
  const improvedBid = await generateBid(job, agent, 2, failureReason);

  console.log("[selfImprove] Backend Agent generated improved bid:", improvedBid);
  
  // Capture successful self-improvement to Sentry
  captureAgentSelfImprove({
    agentId: agent.id,
    jobId: job.job_id,
    improvement: `Reduced price from ${losingBid.price_tokens} to ${improvedBid.price_tokens} tokens, increased confidence from ${losingBid.confidence.toFixed(2)} to ${improvedBid.confidence.toFixed(2)}`,
  });
  await publishEvent({ type: "bid.created", data: improvedBid });

  // Re-award if the improved bid is now the best
  // (For the demo, we'll just publish the improved bid; the frontend shows it as "auto-improved")
}

/**
 * settleTokens() — Mega-prompt #4 ownership (Juan).
 * Publishes a ledger entry to the bus (real persistence + Token Company API integration TBD).
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