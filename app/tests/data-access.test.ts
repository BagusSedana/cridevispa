import { config } from 'dotenv'
import { describe, it, expect } from 'vitest'
config({ path: '.env.local' })
const ready = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

describe.skipIf(!ready)('data access against seeded Supabase', () => {
  it('getCatalog returns Balinese Massage 60 min at Rp 250.000', async () => {
    const { getCatalog } = await import('@/lib/catalog')
    const cats = await getCatalog('id')
    const t = cats.find(c => c.key === 'massage')!.treatments.find(t => t.name === 'Balinese Massage')!
    expect(t.prices[0]).toMatchObject({ durationMinutes: 60, priceIdr: 250000, durationLabel: '60 menit' })
  })
  it('getArticleBySlug returns the published article and null for the draft', async () => {
    const { getArticleBySlug } = await import('@/lib/articles')
    const a = await getArticleBySlug('manfaat-pijat-bali', 'id')
    expect(a?.title).toContain('Pijat')
    expect(a?.body).toContain('Balinese massage')
    expect(await getArticleBySlug('facial-rutin-iklim-tropis-bali', 'id')).toBeNull()
  })
})
