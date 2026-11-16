import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getArticleBySlug } from '@/lib/articles'
import { getLang } from '@/lib/i18n'
import { articleJsonLd, articleUrl } from '@/lib/seo'
import { Markdown } from '@/components/Markdown'
import { ArticleChrome } from '../ArticleChrome'
import { t } from '@/content/copy'
import { waLink, withLang } from '@/lib/links'

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, sp] = await Promise.all([params, searchParams])
  const lang = getLang(sp)
  const a = await getArticleBySlug(slug, lang)
  if (!a) return {}
  return {
    title: a.title,
    description: a.metaDescription,
    alternates: { canonical: articleUrl(slug, lang), languages: { 'id-ID': articleUrl(slug, 'id'), 'en-US': articleUrl(slug, 'en') } },
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
  const wa = waLink(lang)
  const c = t(lang).articles

  return (
    <ArticleChrome lang={lang} path={`/artikel/${slug}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(a)).replace(/</g, '\\u003c') }} />
      <p className="meta">{[a.category, date].filter(Boolean).join(' · ')}</p>
      <h1>{a.title}</h1>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {a.coverImageUrl && <img className="cover" src={a.coverImageUrl} alt="" />}
      {missingTranslation && <p className="note">{c.onlyOther}</p>}
      <article><Markdown source={a.body} /></article>
      <aside className="art-cta">
        <strong>{c.ctaTitle}</strong>
        <div><a href={wa} target="_blank" rel="noopener noreferrer">{t(lang).hero.book}</a></div>
      </aside>
      <p><a href={withLang("/artikel", lang)}>← {c.back}</a></p>
    </ArticleChrome>
  )
}
