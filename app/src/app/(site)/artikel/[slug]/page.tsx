import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getArticleBySlug } from '@/lib/articles'
import { getLang } from '@/lib/i18n'
import { articleJsonLd, articleUrl } from '@/lib/seo'
import { buildWaUrl } from '@/lib/booking/whatsapp'
import { Markdown } from '@/components/Markdown'
import { ArticleChrome } from '../ArticleChrome'

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, sp] = await Promise.all([params, searchParams])
  const lang = getLang(sp)
  const a = await getArticleBySlug(slug, lang)
  if (!a) return {}
  return {
    title: a.title,
    description: a.metaDescription,
    alternates: { canonical: articleUrl(slug), languages: { 'id-ID': articleUrl(slug, 'id'), 'en-US': articleUrl(slug, 'en') } },
    openGraph: { type: 'article', title: a.title, description: a.metaDescription, url: articleUrl(slug, lang), images: a.coverImageUrl ? [a.coverImageUrl] : undefined, publishedTime: a.publishedAt ?? undefined, locale: lang === 'en' ? 'en_US' : 'id_ID' },
  }
}

export default async function ArticlePage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams])
  const lang = getLang(sp)
  const a = await getArticleBySlug(slug, lang)
  if (!a) notFound()
  const missingTranslation = !a.hasTranslation[lang]
  const date = a.publishedAt ? new Date(a.publishedAt).toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
  const wa = buildWaUrl(lang === 'en' ? "Hello CrideviSPA, I'd like to book a home service massage." : 'Halo CrideviSPA, saya ingin reservasi home service massage.')

  return (
    <ArticleChrome lang={lang} path={`/artikel/${slug}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(a)).replace(/</g, '\\u003c') }} />
      <p className="meta">{[a.category, date].filter(Boolean).join(' · ')}</p>
      <h1>{a.title}</h1>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {a.coverImageUrl && <img className="cover" src={a.coverImageUrl} alt="" />}
      {missingTranslation && <p className="note">{lang === 'id' ? 'Artikel ini baru tersedia dalam bahasa Inggris.' : 'This article is only available in Indonesian for now.'}</p>}
      <article><Markdown source={a.body} /></article>
      <aside className="art-cta">
        <strong>{lang === 'en' ? 'Experience it at your villa' : 'Rasakan langsung di villa Anda'}</strong>
        <div><a href={wa} target="_blank" rel="noopener noreferrer">{lang === 'en' ? 'Book via WhatsApp' : 'Booking via WhatsApp'}</a></div>
      </aside>
      <p><a href={`/artikel${lang === 'en' ? '?lang=en' : ''}`}>← {lang === 'en' ? 'All articles' : 'Semua artikel'}</a></p>
    </ArticleChrome>
  )
}
