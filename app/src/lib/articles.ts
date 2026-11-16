import { createPublicClient } from './supabase/server'
import { pick, type Lang } from './i18n'
import type { Article, ArticleSummary } from './types'

const SUMMARY = 'slug,title_id,title_en,excerpt_id,excerpt_en,category,cover_image_url,author,published_at'

type Row = Record<string, unknown> & { slug: string; category: string | null; cover_image_url: string | null; author: string; published_at: string | null }

function toSummary(r: Row, lang: Lang): ArticleSummary {
  return { slug: r.slug, title: pick(r, 'title', lang), excerpt: pick(r, 'excerpt', lang), category: r.category, coverImageUrl: r.cover_image_url, author: r.author, publishedAt: r.published_at }
}

export async function getPublishedArticles(lang: Lang): Promise<ArticleSummary[]> {
  const { data, error } = await createPublicClient().from('articles').select(SUMMARY).eq('published', true).order('published_at', { ascending: false })
  if (error) throw error
  return (data as Row[] ?? []).map(r => toSummary(r, lang))
}

export async function getArticleBySlug(slug: string, lang: Lang): Promise<Article | null> {
  const { data, error } = await createPublicClient()
    .from('articles').select(`${SUMMARY},body_id,body_en,meta_description_id,meta_description_en,updated_at`)
    .eq('slug', slug).eq('published', true).maybeSingle()
  if (error) throw error
  if (!data) return null
  const r = data as Row & { body_id: string; body_en: string; updated_at: string }
  return {
    ...toSummary(r, lang), lang, body: pick(r, 'body', lang),
    metaDescription: pick(r, 'meta_description', lang) || pick(r, 'excerpt', lang), updatedAt: r.updated_at,
    hasTranslation: { id: Boolean(r.body_id?.trim()), en: Boolean(r.body_en?.trim()) },
  }
}
