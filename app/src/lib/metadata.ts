import type { Metadata } from 'next'
import type { Lang } from './i18n'
import { SITE_URL } from './seo'

/** Shared page metadata: canonical always points to the Indonesian www URL (no ?lang), hreflang to both. */
export function pageMetadata({ path, lang, title, description, image = '/assets/hero_bali.jpg' }: {
  path: string; lang: Lang; title: string; description: string; image?: string
}): Metadata {
  const id = `${SITE_URL}${path}`
  const en = `${SITE_URL}${path}${path.includes('?') ? '&' : '?'}lang=en`
  return {
    title: title.includes('CrideviSPA') ? { absolute: title } : title,
    description,
    alternates: { canonical: id, languages: { 'id-ID': id, 'en-US': en, 'x-default': id } },
    openGraph: { type: 'website', url: lang === 'en' ? en : id, title, description, siteName: 'CrideviSPA', locale: lang === 'en' ? 'en_US' : 'id_ID', images: [`${SITE_URL}${image}`] },
  }
}
