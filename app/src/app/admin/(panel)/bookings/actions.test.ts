import { describe, it, expect, vi, beforeEach } from 'vitest'

const update = vi.fn(() => ({ eq: async () => ({ error: null }) }))
let admin = true
vi.mock('@/lib/auth', () => ({ requireAdmin: async () => { if (!admin) throw new Error('NEXT_REDIRECT'); return { userId: 'u' } } }))
vi.mock('@/lib/supabase/server', () => ({ createServerClient: async () => ({ from: () => ({ update }) }) }))
vi.mock('next/cache', () => ({ revalidatePath: () => {} }))

describe('booking actions', () => {
  beforeEach(() => { admin = true; update.mockClear() })
  it('non-admin cannot change a status', async () => {
    admin = false
    const { updateBookingStatus } = await import('./actions')
    await expect(updateBookingStatus('id-1', 'confirmed')).rejects.toThrow('NEXT_REDIRECT')
    expect(update).not.toHaveBeenCalled()
  })
  it('rejects an unknown status', async () => {
    const { updateBookingStatus } = await import('./actions')
    await expect(updateBookingStatus('id-1', 'paid' as never)).rejects.toThrow('Status tidak valid')
    expect(update).not.toHaveBeenCalled()
  })
  it('saves a valid status', async () => {
    const { updateBookingStatus } = await import('./actions')
    await updateBookingStatus('id-1', 'done')
    expect(update).toHaveBeenCalledWith({ status: 'done' })
  })
  it('trims and limits the admin note to 2000 chars', async () => {
    const { updateBookingNote } = await import('./actions')
    await updateBookingNote('id-1', '  ' + 'x'.repeat(2500))
    expect(update).toHaveBeenCalledWith({ admin_note: 'x'.repeat(2000) })
  })
})
