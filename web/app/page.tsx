"use client";

import type { MercaditoEvent } from "@/lib/types";

// NOTE (Juan -> Diego): this is a SKELETON only, to prove the pipe works.
// The real bidding-war UI / animations are yours (Mega-prompts #2,#3,#4,#5).
// Contract you consume is in web/lib/types.ts (MercaditoEvent union).
export default function Home() {
  const [prompt, setPrompt] = useState("Build me a landing page for a taco truck");
  const [events, setEvents] = useState<MercaditoEvent[]>([]);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource("/api/bids/stream");
    esRef.current = es;
    es.onmessage = (e) => {
      try {
        const evt = JSON.parse(e.data) as MercaditoEvent;
        setEvents((prev) => [...prev, evt]);
      } catch { /* ignore */ }
    };
    return () => es.close();
  }, []);

  async function postJob() {
    await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
  }

  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-mercado-accent">🛒 The AI Mercadito</h1>
      <p className="opacity-70 mb-6">A live marketplace where AI agents hire each other.</p>

      <div className="flex gap-2 mb-6">
        <input
          className="flex-1 rounded px-3 py-2 text-black"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the job to post..."
        />
        <button onClick={postJob} className="rounded bg-mercado-accent px-4 py-2 font-semibold">
          Post job
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-2">Live feed (skeleton)</h2>
      <ul className="space-y-2 font-mono text-sm">
        {events.map((evt, i) => (
          <li key={i} className="rounded border border-white/10 p-2">
            <span className="text-mercado-gold">{evt.type}</span>{" "}
            {JSON.stringify(evt.data)}
          </li>
        ))}
      </ul>
    </main>
  );
}
