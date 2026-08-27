type BucketKey = string

// Simple in-memory timestamp buckets per key. Suitable for single-instance/node runtimes.
const buckets: Map<BucketKey, number[]> = new Map()

export interface RateLimitRequestLike {
  headers: {
    get(name: string): string | null
  }
}

function getClientIp(req: RateLimitRequestLike): string {
  const xf = req.headers.get("x-forwarded-for") || ""
  const ip = xf.split(",")[0]?.trim()
  if (ip) return ip
  const xr = req.headers.get("x-real-ip")
  if (xr) return xr
  try {
    return (req as any)?.ip || "unknown"
  } catch {
    return "unknown"
  }
}

export function checkRateLimit(
  req: RateLimitRequestLike,
  key: string,
  limit: number,
  windowMs: number,
  customIdentifier?: string
): { ok: true; remaining: number; resetMs: number } | { ok: false; response: Response } {
  const id = customIdentifier || getClientIp(req)
  const bucketKey: BucketKey = `${key}:${id}`
  const now = Date.now()
  const windowStart = now - windowMs

  const arr = buckets.get(bucketKey) || []
  const recent = arr.filter((t) => t > windowStart)

  if (recent.length >= limit) {
    const oldest = recent[0]
    const resetMs = Math.max(0, windowMs - (now - oldest))
    const res = Response.json(
      { error: "Rate limit exceeded. Please try again later." },
      { status: 429 }
    )
    res.headers.set("Retry-After", Math.ceil(resetMs / 1000).toString())
    res.headers.set("X-RateLimit-Limit", String(limit))
    res.headers.set("X-RateLimit-Remaining", "0")
    return { ok: false, response: res }
  }

  recent.push(now)
  buckets.set(bucketKey, recent)
  const remaining = Math.max(0, limit - recent.length)
  const nextResetMs = recent.length ? Math.max(0, windowMs - (now - recent[0])) : windowMs
  return { ok: true, remaining, resetMs: nextResetMs }
}
