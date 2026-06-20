// Tiny id helper — avoids extra deps. Good enough for a hackathon demo.
export function newId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}
export function nowIso(): string { return new Date().toISOString(); }
