import { describe, it, expect, vi, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { proxy } from './proxy'

const req = (host: string) =>
  new NextRequest(`https://${host}/artikel`, { headers: { host } })

describe('proxy', () => {
  it('public pages are indexable even when proxied via *.vercel.app (canonical points to www)', async () => {
    const res = await proxy(req('cridevispa-app.vercel.app'))
    expect(res.headers.get('x-robots-tag')).toBeNull()
  })
  it('admin pages are always noindex', async () => {
    const res = await proxy(new NextRequest('https://cridevispa-app.vercel.app/admin/login', { headers: { host: 'cridevispa-app.vercel.app' } }))
    expect(res.headers.get('x-robots-tag')).toBe('noindex')
  })
  it('does not set noindex on the real domain', async () => {
    const res = await proxy(req('www.cridevispa.com'))
    expect(res.headers.get('x-robots-tag')).toBeNull()
  })
})

describe('proxy admin guard', () => {
  it('redirects /admin without a session cookie to /admin/login', async () => {
    const res = await proxy(new NextRequest('https://www.cridevispa.com/admin', { headers: { host: 'www.cridevispa.com' } }))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('https://www.cridevispa.com/admin/login')
  })
  it('lets /admin/login through without a session', async () => {
    const res = await proxy(new NextRequest('https://www.cridevispa.com/admin/login', { headers: { host: 'www.cridevispa.com' } }))
    expect(res.status).toBe(200)
  })
  it('lets /admin/lupa-password and /admin/reset-password through', async () => {
    for (const p of ['/admin/lupa-password', '/admin/reset-password']) {
      const res = await proxy(new NextRequest(`https://www.cridevispa.com${p}`, { headers: { host: 'www.cridevispa.com' } }))
      expect(res.status).toBe(200)
    }
  })
})

describe('cutover redirect to www', () => {
  const at = (url: string) => new NextRequest(url, { headers: { host: new URL(url).host } })
  afterEach(() => { vi.unstubAllEnvs() })
  it('flag on + production host → 308 to www keeping path and query', async () => {
    vi.stubEnv('REDIRECT_APP_HOST_TO_WWW', '1')
    const res = await proxy(at('https://cridevispa-app.vercel.app/treatments?lang=en'))
    expect(res.status).toBe(308)
    expect(res.headers.get('location')).toBe('https://www.cridevispa.com/treatments?lang=en')
  })
  it('flag on + preview host → no redirect', async () => {
    vi.stubEnv('REDIRECT_APP_HOST_TO_WWW', '1')
    const res = await proxy(at('https://cridevispa-app-git-phase3-gede-bagus-projects.vercel.app/'))
    expect(res.status).toBe(200)
  })
  it('flag off → no redirect', async () => {
    const res = await proxy(at('https://cridevispa-app.vercel.app/'))
    expect(res.status).toBe(200)
  })
})
