/** "/booking?items=a,b" → ids that exist in the catalog, deduped, max 10. Prices are never taken from the URL. */
export function parsePreselected(raw: string | string[] | undefined, validIds: Set<string>): string[] {
  const parts = (Array.isArray(raw) ? raw : raw ? [raw] : []).flatMap(v => v.split(','))
  const out: string[] = []
  for (const id of parts.map(p => p.trim())) {
    if (validIds.has(id) && !out.includes(id)) out.push(id)
    if (out.length === 10) break
  }
  return out
}
