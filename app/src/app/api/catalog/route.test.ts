import { config } from 'dotenv'
import { describe, it, expect } from 'vitest'
config({ path: '.env.local' })
const ready = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

describe.skipIf(!ready)('GET /api/catalog', () => {
  it('returns flat price options with names and labels', async () => {
    const { GET } = await import('./route')
    const res = await GET(new Request('http://localhost/api/catalog?lang=en'))
    expect(res.status).toBe(200)
    const rows = await res.json()
    const bali = rows.find((r: { name: string; durationMinutes: number }) => r.name === 'Balinese Massage' && r.durationMinutes === 60)
    expect(bali).toMatchObject({ durationLabel: '60 min', priceIdr: 250000 })
    expect(typeof bali.treatmentPriceId).toBe('string')
    expect(res.headers.get('cache-control')).toContain('s-maxage=60')
  })
})
