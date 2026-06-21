import * as Sentry from "@sentry/nextjs";

/**
 * Capture an agent failure to Sentry (Mega-prompt #3).
 * This is "the nervous system that detects when something is broken."
 * 
 * When an agent loses a bidding round, we log it to Sentry so the system
 * can self-diagnose and improve.
 */
export function captureAgentFailure(params: {
  agentId: string;
  jobId: string;
  reason: string;
  bidData?: Record<string, unknown>;
}) {
  if (!process.env.SENTRY_DSN && !process.env.NEXT_PUBLIC_SENTRY_DSN) {
    // Sentry not configured — log to console instead
    console.warn(`[Sentry not configured] Agent failure: ${params.agentId} on job ${params.jobId}`);
    console.warn(`  Reason: ${params.reason}`);
    return;
  }

  Sentry.captureMessage(`Agent [${params.agentId}] lost bidding round`, {
    level: "warning",
    tags: {
      agent_id: params.agentId,
      job_id: params.jobId,
      failure_type: "bidding_loss",
    },
    extra: {
      reason: params.reason,
      bid_data: params.bidData,
    },
  });

  console.log(`[Sentry] Captured agent failure: ${params.agentId}`);
}

/**
 * Capture when an agent self-improves successfully (positive signal).
 */
export function captureAgentSelfImprove(params: {
  agentId: string;
  jobId: string;
  improvement: string;
}) {
  if (!process.env.SENTRY_DSN && !process.env.NEXT_PUBLIC_SENTRY_DSN) {
    console.log(`[Agent self-improved] ${params.agentId}: ${params.improvement}`);
    return;
  }

  Sentry.captureMessage(`Agent [${params.agentId}] self-improved after failure`, {
    level: "info",
    tags: {
      agent_id: params.agentId,
      job_id: params.jobId,
      event_type: "self_improve",
    },
    extra: {
      improvement: params.improvement,
    },
  });

  console.log(`[Sentry] Captured self-improve event: ${params.agentId}`);
}
