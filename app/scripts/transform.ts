import { parseRupiah } from '@/lib/price'

const CATEGORY_META: Record<string, { key: string; name_id: string; name_en: string }> = {
  Massage: { key: 'massage', name_id: 'Pijat', name_en: 'Massage' },
  Foot: { key: 'foot', name_id: 'Refleksi Kaki', name_en: 'Foot Reflexology' },
  Facial: { key: 'facial', name_id: 'Facial', name_en: 'Facial' },
  Ear: { key: 'ear', name_id: 'Ear Candle', name_en: 'Ear Candle' },
  Body: { key: 'body', name_id: 'Perawatan Tubuh', name_en: 'Body Treatment' },
  Packages: { key: 'packages', name_id: 'Paket', name_en: 'Packages' },
}

type LegacyItem = {
  name: string; desc_id: string; desc_en: string; icon?: string | null
  dur30?: string | null; dur60?: string | null; dur90?: string | null
  dur_id?: string | null; dur_en?: string | null; price?: string | null; badge_id?: string | null; badge_en?: string | null
}

export type CategoryRow = { key: string; name_id: string; name_en: string; sort_order: number }
export type TreatmentRow = {
  categoryKey: string; name: string; desc_id: string; desc_en: string; icon: string | null
  badge_id: string | null; badge_en: string | null; is_active: true; sort_order: number
}
export type PriceRow = {
  treatmentName: string; categoryKey: string; duration_minutes: number | null
  duration_label_id: string | null; duration_label_en: string | null; price_idr: number; sort_order: number
}

export function legacyToRows(data: Readonly<Record<string, readonly LegacyItem[]>>) {
  const categories: CategoryRow[] = []
  const treatments: TreatmentRow[] = []
  const prices: PriceRow[] = []

  Object.keys(CATEGORY_META).forEach((legacyKey, ci) => {
    const meta = CATEGORY_META[legacyKey]
    categories.push({ ...meta, sort_order: ci })
    ;(data[legacyKey] ?? []).forEach((t, ti) => {
      treatments.push({
        categoryKey: meta.key, name: t.name, desc_id: t.desc_id, desc_en: t.desc_en, icon: t.icon ?? null,
        badge_id: t.badge_id ?? null, badge_en: t.badge_en ?? null, is_active: true, sort_order: ti,
      })
      const base = { treatmentName: t.name, categoryKey: meta.key }
      const timed: [number, string | null | undefined][] = [[30, t.dur30], [60, t.dur60], [90, t.dur90]]
      let order = 0
      for (const [minutes, price] of timed) {
        if (price) prices.push({ ...base, duration_minutes: minutes, duration_label_id: null, duration_label_en: null, price_idr: parseRupiah(price), sort_order: order++ })
      }
      if (t.price && (t.dur_id || t.dur_en)) {
        prices.push({ ...base, duration_minutes: null, duration_label_id: t.dur_id ?? t.dur_en ?? null, duration_label_en: t.dur_en ?? t.dur_id ?? null, price_idr: parseRupiah(t.price), sort_order: order++ })
      }
    })
  })
  return { categories, treatments, prices }
}
