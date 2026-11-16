const hits = new Map<string, number[]>()

/** In-memory sliding window per server instance. Returns false when over the limit. */
export function allowRequest(key: string, limit = 5, windowMs = 60_000, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter(t => now - t < windowMs)
  if (recent.length >= limit) { hits.set(key, recent); return false }
  recent.push(now)
  hits.set(key, recent)
  return true
}

export function resetRateLimit() { hits.clear() }
