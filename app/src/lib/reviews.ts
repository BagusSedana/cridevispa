import { createPublicClient } from './supabase/server'
import { pick, type Lang } from './i18n'

export type Review = { id: string; name: string; origin: string | null; treatment: string | null; rating: 1 | 2 | 3 | 4 | 5; text: string }

/** Published real reviews, newest first. [] on error or when the table is empty. */
export async function getPublishedReviews(lang: Lang, limit = 6): Promise<Review[]> {
  try {
    const { data, error } = await createPublicClient()
      .from('reviews').select('id,name,origin,treatment,rating,text_id,text_en')
      .eq('published', true).order('created_at', { ascending: false }).limit(limit)
    if (error || !data) return []
    return data.map(r => ({ id: r.id, name: r.name, origin: r.origin, treatment: r.treatment, rating: r.rating as Review['rating'], text: pick(r, 'text', lang) }))
  } catch { return [] }
}
