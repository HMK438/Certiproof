const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 8;

const hits = new Map<string, number[]>();

function prune(now: number) {
  if (hits.size < 5000) return;
  for (const [key, timestamps] of hits) {
    const kept = timestamps.filter((t) => now - t < WINDOW_MS);
    if (kept.length === 0) hits.delete(key);
    else hits.set(key, kept);
  }
}

export function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  prune(now);

  const timestamps = (hits.get(identifier) ?? []).filter((t) => now - t < WINDOW_MS);
  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    hits.set(identifier, timestamps);
    return true;
  }

  timestamps.push(now);
  hits.set(identifier, timestamps);
  return false;
}

export function getClientIdentifier(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
