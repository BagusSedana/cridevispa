import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/auth', () => ({ requireAdmin: async () => ({ userId: 'u' }) }))
vi.mock('next/cache', () => ({ revalidatePath: () => {} }))
vi.mock('next/navigation', () => ({ redirect: (u: string) => { throw new Error('REDIRECT ' + u) } }))
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: async () => ({
    from: () => ({ insert: () => ({ select: () => ({ single: async () => ({ data: null, error: { code: '23505' } }) }) }) }),
  }),
}))

describe('saveArticle', () => {
  it('reports a duplicate slug in Indonesian', async () => {
    const { saveArticle } = await import('./articles/actions')
    const f = new FormData(); f.set('title_id', 'Manfaat Pijat Bali')
    expect(await saveArticle(null, f)).toEqual({ message: 'Slug "manfaat-pijat-bali" sudah dipakai artikel lain. Ganti slug-nya.' })
  })
})
