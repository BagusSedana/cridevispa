import { createPublicClient } from './supabase/server'
import { pick, type Lang } from './i18n'
import type { CategoryWithTreatments } from './types'

export function durationLabel(minutes: number | null, labelId: string | null, labelEn: string | null, lang: Lang): string {
  if (minutes) return lang === 'id' ? `${minutes} menit` : `${minutes} min`
  return (lang === 'id' ? labelId ?? labelEn : labelEn ?? labelId) ?? ''
}

export async function getCatalog(lang: Lang): Promise<CategoryWithTreatments[]> {
  const db = createPublicClient()
  const { data, error } = await db
    .from('categories')
    .select('key,name_id,name_en,sort_order,treatments(id,name,desc_id,desc_en,icon,badge_id,badge_en,sort_order,treatment_prices(id,duration_minutes,duration_label_id,duration_label_en,price_idr,sort_order))')
    .order('sort_order')
  if (error) throw error
  return (data ?? []).map(c => ({
    key: c.key,
    name: pick(c, 'name', lang),
    treatments: [...(c.treatments ?? [])].sort((a, b) => a.sort_order - b.sort_order).map(t => ({
      id: t.id, name: t.name, description: pick(t, 'desc', lang), icon: t.icon, badge: pick(t, 'badge', lang) || null,
      prices: [...(t.treatment_prices ?? [])].sort((a, b) => a.sort_order - b.sort_order).map(p => ({
        id: p.id, durationMinutes: p.duration_minutes, priceIdr: p.price_idr,
        durationLabel: durationLabel(p.duration_minutes, p.duration_label_id, p.duration_label_en, lang),
      })),
    })),
  })).filter(c => c.treatments.length > 0)
}

/** Like getCatalog, but returns null on any error so pages can still render (Review Focus 1). */
export async function getCatalogSafe(lang: Lang): Promise<CategoryWithTreatments[] | null> {
  try { return await getCatalog(lang) } catch (e) { console.error('getCatalog failed', e); return null }
}
