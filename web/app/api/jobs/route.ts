import type { JobPosted } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/jobs — a buyer posts a job into the marketplace.
// Body: { prompt: string, budget_tokens?: number }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt) {
      return NextResponse.json({ error: "Field 'prompt' is required." }, { status: 400 });
    }
    const job: JobPosted = {
      job_id: newId("job"),
      prompt,
      budget_tokens: typeof body?.budget_tokens === "number" ? body.budget_tokens : undefined,
      created_at: nowIso(),
    };

    await publishEvent({ type: "job.posted", data: job });
    // Kick off bids (scaffolding simulator; real engine arrives in Mega-prompt #2).
    void simulateBids(job);

    return NextResponse.json({ ok: true, job }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to post job", detail: String(err) }, { status: 500 });
  }
}
