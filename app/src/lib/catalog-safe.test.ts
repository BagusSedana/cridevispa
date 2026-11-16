import { describe, it, expect, vi, afterEach } from 'vitest'

describe('safe data loaders when Supabase is unreachable (Review Focus 1)', { timeout: 15000 }, () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.resetModules() })
  it('getCatalogSafe returns null instead of throwing', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://127.0.0.1:9')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'x')
    const { getCatalogSafe } = await import('./catalog')
    expect(await getCatalogSafe('id')).toBeNull()
  })
  it('getPriceRange returns null instead of throwing', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://127.0.0.1:9')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'x')
    const { getPriceRange } = await import('./price-range')
    expect(await getPriceRange()).toBeNull()
  })
  it('getPublishedReviews returns [] instead of throwing', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://127.0.0.1:9')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'x')
    const { getPublishedReviews } = await import('./reviews')
    expect(await getPublishedReviews('id')).toEqual([])
  })
})
