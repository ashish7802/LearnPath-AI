/**
 * In-memory sliding-window rate limiter for serverless & edge routes
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup expired keys periodically
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);
if (typeof cleanupTimer.unref === 'function') {
  cleanupTimer.unref();
}

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowSeconds: number = 60
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const existing = rateLimitStore.get(identifier);

  if (!existing || now > existing.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetInSeconds: windowSeconds,
    };
  }

  if (existing.count >= maxRequests) {
    const resetInSeconds = Math.max(1, Math.ceil((existing.resetTime - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds,
    };
  }

  existing.count += 1;
  const resetInSeconds = Math.max(1, Math.ceil((existing.resetTime - now) / 1000));
  return {
    allowed: true,
    remaining: maxRequests - existing.count,
    resetInSeconds,
  };
}
