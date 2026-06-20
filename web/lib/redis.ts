import Redis from "ioredis";
// =============================================================================
// Redis is the "shared memory of the agent economy" (CLAUDE.md).
// To keep the demo runnable with ZERO infrastructure, we fall back to an
// in-process pub/sub bus when REDIS_URL is not set. This means a single Next.js
// process still works end-to-end; multiple processes / real scale need Redis.
//   TODO(real-redis): set REDIS_URL (local redis or Upstash rediss://...) to
//   switch automatically to the real distributed bus.
// =============================================================================

type Listener = (event: MercaditoEvent) => void;

class InMemoryBus {
  private listeners = new Set<Listener>();
  publish(event: MercaditoEvent) {
    for (const l of this.listeners) {
      try { l(event); } catch { /* isolate listener errors */ }
    }
  }
  subscribe(l: Listener): () => void {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }
}

// A module-level singleton survives across hot reloads / route invocations
// within the same Node process.
const g = globalThis as unknown as {
  __mercadito_bus?: InMemoryBus;
  __mercadito_pub?: Redis;
};

export const inMemoryBus = (g.__mercadito_bus ??= new InMemoryBus());

export function hasRealRedis(): boolean {
  return Boolean(process.env.REDIS_URL);
}

/** Lazily-created publisher connection (only when REDIS_URL is configured). */
export function getPublisher(): Redis | null {
  if (!hasRealRedis()) return null;
  if (!g.__mercadito_pub) {
    g.__mercadito_pub = new Redis(process.env.REDIS_URL!, { lazyConnect: false, maxRetriesPerRequest: 3 });
  }
  return g.__mercadito_pub;
}

/** Create a dedicated subscriber connection (Redis requires one per subscriber). */
export function createSubscriber(): Redis | null {
  if (!hasRealRedis()) return null;
  return new Redis(process.env.REDIS_URL!, { lazyConnect: false, maxRetriesPerRequest: null });
}

/** Publish a marketplace event to whichever bus is active. */
export async function publishEvent(event: MercaditoEvent): Promise<void> {
  const pub = getPublisher();
  if (pub) {
    await pub.publish(MERCADITO_CHANNEL, JSON.stringify(event));
  } else {
    inMemoryBus.publish(event);
  }
}

/**
 * Subscribe to marketplace events. Returns an unsubscribe function.
 * Works against real Redis or the in-memory fallback transparently.
 */
export function subscribeEvents(onEvent: (e: MercaditoEvent) => void): () => void {
  const sub = createSubscriber();
  if (sub) {
    sub.subscribe(MERCADITO_CHANNEL).catch(() => { /* surfaced via Sentry elsewhere */ });
    const handler = (_channel: string, message: string) => {
      try { onEvent(JSON.parse(message) as MercaditoEvent); } catch { /* ignore bad payloads */ }
    };
    sub.on("message", handler);
    return () => { sub.off("message", handler); sub.quit().catch(() => {}); };
  }
  return inMemoryBus.subscribe(onEvent);
}
