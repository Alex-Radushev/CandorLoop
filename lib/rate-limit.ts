type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 20;

export function checkRateLimit(identifier: string, now = Date.now()) {
  if (buckets.size > 1000) {
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }

  const current = buckets.get(identifier);

  if (!current || current.resetAt <= now) {
    const next = { count: 1, resetAt: now + WINDOW_MS };
    buckets.set(identifier, next);
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt: next.resetAt };
  }

  if (current.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  return {
    allowed: true,
    remaining: MAX_REQUESTS - current.count,
    resetAt: current.resetAt,
  };
}

export function clearRateLimitsForTests() {
  buckets.clear();
}
