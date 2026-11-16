import { describe, it, expect } from 'vitest'
import { parseRupiah } from '@/lib/price'
import { legacyToRows } from './transform'
import { LEGACY_TREATMENTS } from './legacy-data'

describe('parseRupiah', () => {
  it('parses "Rp 250.000"', () => expect(parseRupiah('Rp 250.000')).toBe(250000))
  it('parses "Rp 1.250.000"', () => expect(parseRupiah('Rp 1.250.000')).toBe(1250000))
  it('throws on text without digits', () => expect(() => parseRupiah('gratis')).toThrow())
})

describe('legacyToRows', () => {
  const rows = legacyToRows(LEGACY_TREATMENTS)
  it('creates the six categories', () => {
    expect(rows.categories.map(c => c.key)).toEqual(['massage', 'foot', 'facial', 'ear', 'body', 'packages'])
  })
  it('keeps every legacy treatment', () => {
    const legacyCount = Object.values(LEGACY_TREATMENTS).reduce((n, list) => n + list.length, 0)
    expect(rows.treatments).toHaveLength(legacyCount)
  })
  it('Balinese Massage gets 60 and 90 minute prices', () => {
    const prices = rows.prices.filter(p => p.treatmentName === 'Balinese Massage')
    expect(prices.map(p => [p.duration_minutes, p.price_idr])).toEqual([[60, 250000], [90, 350000]])
  })
  it('packages keep their text duration label and no minutes', () => {
    const pkg = LEGACY_TREATMENTS.Packages[0]
    const price = rows.prices.find(p => p.treatmentName === pkg.name)!
    expect(price.duration_minutes).toBeNull()
    expect(price.duration_label_id).toBe(pkg.dur_id)
    expect(price.duration_label_en).toBe(pkg.dur_en)
    expect(price.price_idr).toBe(parseRupiah(pkg.price))
  })
})
