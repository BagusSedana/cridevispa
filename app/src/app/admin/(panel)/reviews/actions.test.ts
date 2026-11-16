import { describe, it, expect, vi, beforeEach } from 'vitest'

let admin = true
const insert = vi.fn(async () => ({ error: null }))
const from = vi.fn(() => ({ insert, update: () => ({ eq: async () => ({ error: null }) }) }))
vi.mock('@/lib/auth', () => ({ requireAdmin: async () => { if (!admin) throw new Error('NEXT_REDIRECT'); return { userId: 'u' } } }))
vi.mock('@/lib/supabase/server', () => ({ createServerClient: async () => ({ from }) }))
vi.mock('next/cache', () => ({ revalidatePath: () => {} }))

const fd = (o: Record<string, string>) => { const f = new FormData(); Object.entries(o).forEach(([k, v]) => f.set(k, v)); return f }

describe('review actions', () => {
  beforeEach(() => { admin = true; from.mockClear(); insert.mockClear() })
  it('non-admin cannot save', async () => {
    admin = false
    const { saveReview } = await import('./actions')
    await expect(saveReview(null, fd({ name: 'Made', rating: '5', text_id: 'Bagus' }))).rejects.toThrow('NEXT_REDIRECT')
    expect(from).not.toHaveBeenCalled()
  })
  it('rejects rating 6', async () => {
    const { saveReview } = await import('./actions')
    expect(await saveReview(null, fd({ name: 'Made', rating: '6', text_id: 'Bagus' }))).toEqual({ message: 'Rating harus 1 sampai 5.' })
  })
  it('rejects empty texts', async () => {
    const { saveReview } = await import('./actions')
    expect(await saveReview(null, fd({ name: 'Made', rating: '5', text_id: ' ', text_en: '' }))).toEqual({ message: 'Isi ulasan (Indonesia atau English) wajib diisi.' })
  })
  it('saves a valid review as unpublished draft', async () => {
    const { saveReview } = await import('./actions')
    expect(await saveReview(null, fd({ name: ' Made ', origin: 'Sanur', rating: '4', text_id: 'Bagus' }))).toEqual({ message: 'Ulasan tersimpan (belum tampil — klik Tampilkan).', ok: true })
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ name: 'Made', rating: 4, published: false }))
  })
})
