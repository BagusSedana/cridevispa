import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { proxy } from './proxy'

const req = (host: string) =>
  new NextRequest(`https://${host}/artikel`, { headers: { host } })

describe('proxy', () => {
  it('noindexOnVercelHost: sets X-Robots-Tag noindex on *.vercel.app', async () => {
    const res = await proxy(req('cridevispa-app.vercel.app'))
    expect(res.headers.get('x-robots-tag')).toBe('noindex')
  })
  it('does not set noindex on the real domain', async () => {
    const res = await proxy(req('www.cridevispa.com'))
    expect(res.headers.get('x-robots-tag')).toBeNull()
  })
})
