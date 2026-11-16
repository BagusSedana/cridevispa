import { describe, it, expect } from 'vitest'
import { parsePriceForm, parseTreatmentForm } from './validate'

const fd = (o: Record<string, string>) => { const f = new FormData(); Object.entries(o).forEach(([k, v]) => f.set(k, v)); return f }

describe('parsePriceForm', () => {
  it('accepts minutes + price, ignoring "Rp" and dots', () => {
    expect(parsePriceForm(fd({ duration_minutes: '60', price_idr: 'Rp 250.000' }))).toEqual({ ok: true, data: { duration_minutes: 60, duration_label_id: null, duration_label_en: null, price_idr: 250000 } })
  })
  it('accepts a text label without minutes (packages)', () => {
    const r = parsePriceForm(fd({ duration_minutes: '', duration_label_id: '2,5 jam', duration_label_en: '2.5 hours', price_idr: '650000' }))
    expect(r).toEqual({ ok: true, data: { duration_minutes: null, duration_label_id: '2,5 jam', duration_label_en: '2.5 hours', price_idr: 650000 } })
  })
  it('rejects zero price', () => expect(parsePriceForm(fd({ duration_minutes: '60', price_idr: '0' }))).toEqual({ ok: false, error: 'Harga harus lebih dari 0.' }))
  it('rejects decimals', () => expect(parsePriceForm(fd({ duration_minutes: '60', price_idr: '250000,50' })).ok).toBe(false))
  it('rejects neither minutes nor label', () => expect(parsePriceForm(fd({ duration_minutes: '', price_idr: '1000' }))).toEqual({ ok: false, error: 'Isi durasi (menit) atau label durasi.' }))
})

describe('parseTreatmentForm', () => {
  it('requires a name', () => expect(parseTreatmentForm(fd({ name: ' ', category_id: 'c' }))).toEqual({ ok: false, error: 'Nama treatment wajib diisi.' }))
  it('trims fields and maps empty badges to null', () => {
    const r = parseTreatmentForm(fd({ name: ' Lulur ', category_id: 'c', desc_id: ' a ', desc_en: 'b', badge_id: '', badge_en: '' }))
    expect(r).toEqual({ ok: true, data: { name: 'Lulur', category_id: 'c', desc_id: 'a', desc_en: 'b', icon: null, badge_id: null, badge_en: null } })
  })
})
