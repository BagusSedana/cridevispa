import { config } from 'dotenv'
import { describe, it, expect } from 'vitest'
config({ path: '.env.local' })
const ready = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

describe.skipIf(!ready)('getPriceRange', () => {
  it('returns the cheapest and most expensive active price (prices unchanged: min Rp 100.000)', async () => {
    const { getPriceRange } = await import('./price-range')
    const r = await getPriceRange()
    expect(r?.min).toBe(100000)
    expect(r!.max).toBeGreaterThan(r!.min)
  })
})
