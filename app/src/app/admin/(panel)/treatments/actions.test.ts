import { describe, it, expect, vi } from 'vitest'

let admin = false
const from = vi.fn()
vi.mock('@/lib/auth', () => ({ requireAdmin: async () => { if (!admin) throw new Error('NEXT_REDIRECT'); return { userId: 'u' } } }))
vi.mock('@/lib/supabase/server', () => ({ createServerClient: async () => ({ from }) }))
vi.mock('next/cache', () => ({ revalidatePath: () => {} }))

const fd = (o: Record<string, string>) => { const f = new FormData(); Object.entries(o).forEach(([k, v]) => f.set(k, v)); return f }

describe('treatment actions', () => {
  it('non-admin cannot save a price', async () => {
    const { savePrice } = await import('./actions')
    await expect(savePrice(null, fd({ treatment_id: 't', duration_minutes: '60', price_idr: '1000' }))).rejects.toThrow('NEXT_REDIRECT')
    expect(from).not.toHaveBeenCalled()
  })
  it('invalid price returns the validation message without touching the database', async () => {
    admin = true
    const { savePrice } = await import('./actions')
    expect(await savePrice(null, fd({ treatment_id: 't', duration_minutes: '60', price_idr: '0' }))).toEqual({ message: 'Harga harus lebih dari 0.' })
    expect(from).not.toHaveBeenCalled()
  })
})
