export type Parsed<T> = { ok: true; data: T } | { ok: false; error: string }

const text = (f: FormData, k: string) => String(f.get(k) ?? '').trim()
const orNull = (s: string) => (s ? s : null)

export type PriceInput = { duration_minutes: number | null; duration_label_id: string | null; duration_label_en: string | null; price_idr: number }

export function parsePriceForm(f: FormData): Parsed<PriceInput> {
  const rawPrice = text(f, 'price_idr').replace(/^Rp\s*/i, '').replace(/\./g, '').replace(/\s/g, '')
  if (!/^\d+$/.test(rawPrice)) return { ok: false, error: 'Harga harus angka bulat (contoh 250000).' }
  const price = Number(rawPrice)
  if (price <= 0) return { ok: false, error: 'Harga harus lebih dari 0.' }

  const rawMinutes = text(f, 'duration_minutes')
  const minutes = rawMinutes ? Number(rawMinutes) : null
  if (minutes !== null && (!Number.isInteger(minutes) || minutes <= 0)) return { ok: false, error: 'Durasi menit harus angka bulat.' }
  const labelId = orNull(text(f, 'duration_label_id'))
  const labelEn = orNull(text(f, 'duration_label_en'))
  if (minutes === null && !labelId) return { ok: false, error: 'Isi durasi (menit) atau label durasi.' }

  return { ok: true, data: { duration_minutes: minutes, duration_label_id: minutes === null ? labelId : null, duration_label_en: minutes === null ? labelEn : null, price_idr: price } }
}

export type TreatmentInput = { name: string; category_id: string; desc_id: string; desc_en: string; icon: string | null; badge_id: string | null; badge_en: string | null }

export function parseTreatmentForm(f: FormData): Parsed<TreatmentInput> {
  const name = text(f, 'name')
  if (!name) return { ok: false, error: 'Nama treatment wajib diisi.' }
  const category_id = text(f, 'category_id')
  if (!category_id) return { ok: false, error: 'Pilih kategori.' }
  return { ok: true, data: {
    name, category_id, desc_id: text(f, 'desc_id'), desc_en: text(f, 'desc_en'),
    icon: orNull(text(f, 'icon')), badge_id: orNull(text(f, 'badge_id')), badge_en: orNull(text(f, 'badge_en')),
  } }
}
