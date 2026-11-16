import type { Article } from './types'
import type { Lang } from './i18n'

export const SITE_URL = 'https://www.cridevispa.com'
export const SITE_NAME = 'CrideviSPA'

export const articleUrl = (slug: string, lang: Lang = 'id') =>
  `${SITE_URL}/artikel/${slug}${lang === 'en' ? '?lang=en' : ''}`

export function articleJsonLd(a: Article) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.metaDescription,
    inLanguage: a.lang === 'en' ? 'en-US' : 'id-ID',
    mainEntityOfPage: articleUrl(a.slug),
    datePublished: a.publishedAt ?? undefined,
    dateModified: a.updatedAt,
    image: a.coverImageUrl ?? undefined,
    author: { '@type': 'Organization', name: a.author },
    publisher: { '@type': 'Organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: `${SITE_URL}/assets/cridevispa_logo.png` } },
  }
}
