import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'

const exchange = vi.fn(async (code: string) => ({ error: code === 'good' ? null : { message: 'bad' } }))
vi.mock('@/lib/supabase/server', () => ({ createServerClient: async () => ({ auth: { exchangeCodeForSession: exchange } }) }))

// www proxies to the app, so request.url carries the vercel.app host.
const call = async (qs: string) => {
  const { GET } = await import('./route')
  return GET(new NextRequest(`https://cridevispa-app.vercel.app/admin/auth/confirm${qs}`))
}

describe('GET /admin/auth/confirm', () => {
  it('redirects to the www reset page after a good code', async () => {
    const res = await call('?code=good&next=/admin/reset-password')
    expect(res.headers.get('location')).toBe('https://www.cridevispa.com/admin/reset-password')
  })
  it('sends expired links back to the www forgot page', async () => {
    const res = await call('?code=bad')
    expect(res.headers.get('location')).toBe('https://www.cridevispa.com/admin/lupa-password?error=expired')
  })
  it('ignores a next param outside /admin', async () => {
    const res = await call('?code=good&next=https://evil.example')
    expect(res.headers.get('location')).toBe('https://www.cridevispa.com/admin')
  })
})
