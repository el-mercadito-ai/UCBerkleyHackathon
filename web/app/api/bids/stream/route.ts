import type { MercaditoEvent } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/bids/stream — Server-Sent Events stream of all marketplace events.
// The frontend (Diego) consumes this with EventSource and renders the bidding war.
export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: MercaditoEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      // Initial comment + hello so the client knows the stream is live.
      controller.enqueue(encoder.encode(": connected\n\n"));
      send({ type: "job.posted", data: { job_id: "hello", prompt: "stream ready", created_at: new Date().toISOString() } } as MercaditoEvent);

      const unsubscribe = subscribeEvents(send);

      // Heartbeat keeps proxies from closing the idle connection.
      const heartbeat = setInterval(() => {
        try { controller.enqueue(encoder.encode(": ping\n\n")); } catch { /* closed */ }
      }, 15000);

      // @ts-expect-error — attach cleanup for cancel().
      controller._cleanup = () => { clearInterval(heartbeat); unsubscribe(); };
    },
    cancel() {
      // @ts-expect-error — best-effort cleanup.
      this._cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
