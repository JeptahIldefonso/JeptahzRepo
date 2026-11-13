/**
 * Sliding Window Rate Limiter (Blueprint Section 14)
 * Protects public endpoints (contact, auth) against brute force and spam.
 */

interface RateLimitStoreEntry {
  timestamps: number[];
}

const localRateLimitStore = new Map<string, RateLimitStoreEntry>();

// Clean up stale entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of localRateLimitStore.entries()) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < 3600000);
    if (entry.timestamps.length === 0) {
      localRateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

export async function limit(
  key: string,
  limitCount = 5,
  windowMs = 60 * 60 * 1000 // 1 hour
): Promise<{ success: boolean; remaining: number }> {
  // If Upstash Redis credentials are provided, we could use them
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const url = `${process.env.UPSTASH_REDIS_REST_URL}/pipeline`;
      const now = Date.now();
      const clearBefore = now - windowMs;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["ZREMRANGEBYSCORE", key, 0, clearBefore],
          ["ZADD", key, now, `${now}-${Math.random()}`],
          ["ZCARD", key],
          ["EXPIRE", key, Math.ceil(windowMs / 1000)],
        ]),
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        const currentCount = data?.[2]?.result ?? 1;
        return {
          success: currentCount <= limitCount,
          remaining: Math.max(0, limitCount - currentCount),
        };
      }
    } catch {
      // Fallback to local in-memory
    }
  }

  // Local sliding window fallback
  const now = Date.now();
  const windowStart = now - windowMs;
  const entry = localRateLimitStore.get(key) || { timestamps: [] };

  entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

  if (entry.timestamps.length >= limitCount) {
    return { success: false, remaining: 0 };
  }

  entry.timestamps.push(now);
  localRateLimitStore.set(key, entry);

  return {
    success: true,
    remaining: limitCount - entry.timestamps.length,
  };
}
