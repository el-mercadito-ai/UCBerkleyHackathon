// =============================================================================
// THE AI MERCADITO — shared data contract
// =============================================================================
// This file is the single source of truth for the JSON that flows between the
// orchestrator (Juan), the agents (Juan), and the frontend (Diego).
// Keep the Python models in /agents/models.py in sync with these shapes.
// Per CLAUDE.md Mega-prompt #2, the Bid contract is:
//   { price_tokens, eta_minutes, confidence, pitch }
// =============================================================================

/** A job posted by a human (or another agent) into the marketplace. */
export interface JobPosted {
  job_id: string;
  /** Natural-language description of what the buyer wants built. */
  prompt: string;
  /** Optional budget ceiling, in tokens. */
  budget_tokens?: number;
  created_at: string; // ISO timestamp
}

/** Which specialist agent produced a bid. */
export type AgentRole = "ux" | "backend" | "growth" | "qa";

/** A bid from an agent competing for a job. THE core contract. */
export interface Bid {
  bid_id: string;
  job_id: string;
  agent_id: string;       // e.g. "backend_agent"
  agent_role: AgentRole;
  price_tokens: number;   // how many tokens the agent charges
  eta_minutes: number;    // estimated time to deliver
  confidence: number;     // 0..1 self-reported confidence
  pitch: string;          // short sales pitch shown in the bidding war
  /** Self-improve loop (Mega-prompt #3): 1 = first try, 2 = auto-improved. */
  round: number;
  created_at: string;
}

/** Sent when the orchestrator awards a job to a winning bid. */
export interface JobAwarded {
  job_id: string;
  winning_bid_id: string;
  agent_id: string;
  price_tokens: number;
  created_at: string;
}

/** QA Agent report (Mega-prompt #5), rendered as a card by the frontend. */
export interface QaReport {
  job_id: string;
  passed: boolean;
  summary: string;
  screenshot_url?: string;
  created_at: string;
}

/** A line in the token ledger settled by settleTokens() (Mega-prompt #4). */
export interface LedgerEntry {
  entry_id: string;
  job_id: string;
  from: string;   // payer ("buyer" or an agent id)
  to: string;     // payee (winning agent id)
  amount_tokens: number;
  reason: string;
  created_at: string;
}

/** Discriminated union of everything published on the realtime bus. */
export type MercaditoEvent =
  | { type: "job.posted"; data: JobPosted }
  | { type: "bid.created"; data: Bid }
  | { type: "job.awarded"; data: JobAwarded }
  | { type: "qa.report"; data: QaReport }
  | { type: "ledger.entry"; data: LedgerEntry };

/** Redis pub/sub channel used for all realtime marketplace events. */
export const MERCADITO_CHANNEL = "mercadito:events";
