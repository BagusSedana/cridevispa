import type { Metadata } from 'next'
import { getPublishedArticles } from '@/lib/articles'
import { getLang } from '@/lib/i18n'
import { SITE_URL } from '@/lib/seo'
import { ArticleChrome } from './ArticleChrome'

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const lang = getLang(await searchParams)
  return {
    title: lang === 'en' ? 'Wellness Articles' : 'Artikel Wellness',
    description: lang === 'en' ? 'Tips on massage, skincare and relaxation from CrideviSPA, Bali.' : 'Tips pijat, perawatan kulit dan relaksasi dari CrideviSPA, Bali.',
    alternates: { canonical: `${SITE_URL}/artikel`, languages: { 'id-ID': `${SITE_URL}/artikel`, 'en-US': `${SITE_URL}/artikel?lang=en` } },
  }
}

export default async function ArticlesIndex({ searchParams }: Props) {
  const lang = getLang(await searchParams)
  const articles = await getPublishedArticles(lang)
  const q = lang === 'en' ? '?lang=en' : ''
  return (
    <ArticleChrome lang={lang} path="/artikel">
      <p className="meta">CrideviSPA Journal</p>
      <h1>{lang === 'en' ? 'Wellness Articles' : 'Artikel Wellness'}</h1>
      {articles.length === 0 && <p>{lang === 'en' ? 'No articles yet.' : 'Belum ada artikel.'}</p>}
      <ul className="art-list">
        {articles.map(a => (
          <li key={a.slug}>
            <a href={`/artikel/${a.slug}${q}`}>
              {a.category && <span className="meta">{a.category}</span>}
              <h2>{a.title}</h2>
              <p>{a.excerpt}</p>
            </a>
          </li>
        ))}
      </ul>
    </ArticleChrome>
  )
}
