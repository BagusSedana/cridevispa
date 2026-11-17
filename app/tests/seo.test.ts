import { config } from 'dotenv'
import { describe, it, expect } from 'vitest'
config({ path: '.env.local' })
const ready = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

describe('legacy redirect', () => {
  it('/artikel/manfaat-pijat-bali.html → 301 /artikel/manfaat-pijat-bali', async () => {
    const { default: nextConfig } = await import('../next.config')
    const rules = await nextConfig.redirects!()
    const rule = rules.find(r => r.source === '/artikel/:slug.html')!
    expect(rule).toMatchObject({ destination: '/artikel/:slug', statusCode: 301 })
  })
})

describe.skipIf(!ready)('sitemap', () => {
  it('lists published articles only, on the www domain', async () => {
    const { default: sitemap } = await import('../src/app/sitemap')
    const urls = (await sitemap()).map(e => e.url)
    expect(urls).toContain('https://www.cridevispa.com/artikel/manfaat-pijat-bali')
    expect(urls).toContain('https://www.cridevispa.com/')
    expect(urls.some(u => u.includes('facial-rutin-iklim-tropis-bali'))).toBe(false)
  })
})

describe('articleJsonLd', () => {
  it('builds Article structured data with canonical url', async () => {
    const { articleJsonLd } = await import('../src/lib/seo')
    const ld = articleJsonLd({ slug: 'x', title: 'T', excerpt: 'E', category: null, coverImageUrl: null, author: 'A', publishedAt: '2026-08-16T00:00:00Z', body: '', metaDescription: 'D', updatedAt: '2026-08-17T00:00:00Z', lang: 'id', hasTranslation: { id: true, en: false } })
    expect(ld).toMatchObject({ '@type': 'Article', headline: 'T', mainEntityOfPage: 'https://www.cridevispa.com/artikel/x', inLanguage: 'id-ID', datePublished: '2026-08-16T00:00:00Z' })
  })
})

describe('phase 3 SEO', () => {
  it('redirects /index.html to / (301)', async () => {
    const { default: nextConfig } = await import('../next.config')
    const rules = await nextConfig.redirects!()
    expect(rules.find(r => r.source === '/index.html')).toMatchObject({ destination: '/', statusCode: 301 })
  })
  it('pageMetadata: Indonesian canonical has no ?lang; English is self-canonical', async () => {
    const { pageMetadata } = await import('../src/lib/metadata')
    const m = pageMetadata({ path: '/treatments', lang: 'en', title: 'T', description: 'D' })
    expect(m.alternates?.canonical).toBe('https://www.cridevispa.com/treatments?lang=en')
    expect((m.alternates?.languages as Record<string, string>)['en-US']).toBe('https://www.cridevispa.com/treatments?lang=en')
  })
})

describe.skipIf(!ready)('phase 3 sitemap', () => {
  it('includes /treatments and /lokasi', async () => {
    const { default: sitemap } = await import('../src/app/sitemap')
    const urls = (await sitemap()).map(e => e.url)
    expect(urls).toEqual(expect.arrayContaining(['https://www.cridevispa.com/treatments', 'https://www.cridevispa.com/lokasi']))
  })
})

describe('Search Console file', () => {
  it('rewrites /google0a6bca9b0fd31cf8.html to the verification route', async () => {
    const { default: nextConfig } = await import('../next.config')
    const rules = await nextConfig.rewrites!()
    expect(rules).toEqual(expect.arrayContaining([{ source: '/google0a6bca9b0fd31cf8.html', destination: '/google-verification' }]))
  })
})
