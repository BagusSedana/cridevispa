import { describe, it, expect, vi } from 'vitest'

const resetPasswordForEmail = vi.fn(async (email: string) =>
  email === 'known@example.com' ? { data: {}, error: null } : { data: null, error: { message: 'User not found' } })
vi.mock('@/lib/supabase/server', () => ({ createServerClient: async () => ({ auth: { resetPasswordForEmail } }) }))

describe('requestPasswordReset', () => {
  it('returns the same message for a known and an unknown email', async () => {
    const { requestPasswordReset } = await import('./actions')
    const form = (email: string) => { const f = new FormData(); f.set('email', email); return f }
    const known = await requestPasswordReset(null, form('known@example.com'))
    const unknown = await requestPasswordReset(null, form('nobody@example.com'))
    expect(known).toEqual(unknown)
    expect(known.message).toBe('Jika email terdaftar, link reset sudah dikirim. Cek inbox atau folder spam.')
    expect(resetPasswordForEmail).toHaveBeenCalledWith('known@example.com', { redirectTo: expect.stringMatching(/\/admin\/reset-password$/) })
  })
  it('rejects a new password shorter than 12 characters', async () => {
    const { validateNewPassword } = await import('@/lib/password')
    expect(validateNewPassword('short', 'short')).toBe('Password minimal 12 karakter.')
    expect(validateNewPassword('abcdefghijkl', 'abcdefghijkX')).toBe('Konfirmasi password tidak sama.')
    expect(validateNewPassword('abcdefghijkl', 'abcdefghijkl')).toBeNull()
  })
})
