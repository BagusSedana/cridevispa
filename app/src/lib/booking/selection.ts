/**
 * Booking selection kept in sessionStorage so treatment ids never appear in the URL.
 * Ids are only hints: the booking form keeps those that exist in the catalog and the API re-checks them.
 */
const KEY = 'cridevispa:booking-items'

export function readSelection(): string[] {
  try {
    const v = JSON.parse(sessionStorage.getItem(KEY) ?? '[]')
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string').slice(0, 10) : []
  } catch { return [] }
}

export function writeSelection(ids: string[]): void {
  try { sessionStorage.setItem(KEY, JSON.stringify([...new Set(ids)].slice(0, 10))) } catch { /* storage blocked: selection just isn't remembered */ }
}

export function addToSelection(id: string): void {
  writeSelection([...readSelection(), id])
}

export function clearSelection(): void {
  try { sessionStorage.removeItem(KEY) } catch { /* ignore */ }
}
