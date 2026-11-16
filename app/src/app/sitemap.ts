import type { MetadataRoute } from 'next'
import { createPublicClient } from '@/lib/supabase/server'
import { SITE_URL } from '@/lib/seo'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data } = await createPublicClient().from('articles').select('slug,updated_at').eq('published', true)
  const articles = (data ?? []).map(a => ({
    url: `${SITE_URL}/artikel/${a.slug}`,
    lastModified: a.updated_at,
    alternates: { languages: { 'id-ID': `${SITE_URL}/artikel/${a.slug}`, 'en-US': `${SITE_URL}/artikel/${a.slug}?lang=en` } },
  }))
  return [
    { url: `${SITE_URL}/`, alternates: { languages: { 'id-ID': `${SITE_URL}/`, 'en-US': `${SITE_URL}/?lang=en` } } },
    { url: `${SITE_URL}/artikel` },
    ...articles,
  ]
}
