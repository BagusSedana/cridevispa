import { describe, it, expect, vi } from 'vitest'
import { existsSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { SiteShell } from '@/components/site/SiteShell'
import { pageMetadata } from '@/lib/metadata'

describe('final-review fixes', () => {
  it('#2 root files the static site served exist in app/public', () => {
    expect(existsSync('src/app/google0a6bca9b0fd31cf8.html/route.ts')).toBe(true)
    for (const f of ['site.webmanifest', 'apple-touch-icon.png', 'favicon-16x16.png', 'favicon-32x32.png', 'favicon-192.png', 'favicon-512.png'])
      expect(existsSync(`public/${f}`), f).toBe(true)
  })
  it('#3 English pages declare lang="en" on the page wrapper', () => {
    expect(renderToStaticMarkup(<SiteShell lang="en" path="/">x</SiteShell>)).toContain('lang="en"')
  })
  it('#5 English pages are self-canonical', () => {
    expect(pageMetadata({ path: '/treatments', lang: 'en', title: 'T', description: 'D' }).alternates?.canonical).toBe('https://www.cridevispa.com/treatments?lang=en')
    expect(pageMetadata({ path: '/treatments', lang: 'id', title: 'T', description: 'D' }).alternates?.canonical).toBe('https://www.cridevispa.com/treatments')
  })
  it('#6 language switch keeps the page query', () => {
    const html = renderToStaticMarkup(<SiteShell lang="id" path="/booking?items=a,b">x</SiteShell>)
    expect(html).toContain('href="/booking?items=a%2Cb&amp;lang=en"')
  })
  it('#1 the site error page offers WhatsApp', async () => {
    const { default: ErrorPage } = await import('@/app/(site)/error')
    const html = renderToStaticMarkup(<ErrorPage error={new Error('db down')} reset={() => {}} />)
    expect(html).toContain('https://wa.me/6285812429650')
  })
})

describe('#4 review publish surfaces DB errors', () => {
  it('setReviewPublished throws when the update fails', async () => {
    vi.doMock('@/lib/auth', () => ({ requireAdmin: async () => ({ userId: 'u' }) }))
    vi.doMock('next/cache', () => ({ revalidatePath: () => {} }))
    vi.doMock('@/lib/supabase/server', () => ({ createServerClient: async () => ({ from: () => ({ update: () => ({ eq: async () => ({ error: { message: 'x' } }) }) }) }) }))
    const { setReviewPublished } = await import('@/app/admin/(panel)/reviews/actions')
    await expect(setReviewPublished('id', true)).rejects.toThrow('Gagal mengubah status ulasan')
  })
})
