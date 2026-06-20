export const runtime = "nodejs";
export async function GET() {
  return NextResponse.json({ ok: true, redis: hasRealRedis() ? "configured" : "in-memory-fallback" });
}
