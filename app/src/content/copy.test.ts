import { describe, it, expect } from 'vitest'
import { COPY, t } from './copy'

function shape(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(shape)
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, shape(x)]))
  return typeof v
}
function strings(v: unknown): string[] {
  if (typeof v === 'string') return [v]
  if (Array.isArray(v)) return v.flatMap(strings)
  if (v && typeof v === 'object') return Object.values(v).flatMap(strings)
  return []
}

describe('COPY', () => {
  it('ID and EN have the same shape', () => expect(shape(COPY.en)).toEqual(shape(COPY.id)))
  it('has no empty strings', () => {
    for (const lang of ['id', 'en'] as const) expect(strings(COPY[lang]).filter(s => !s.trim())).toEqual([])
  })
  it('has exactly six trust facts', () => expect(t('id').trust.items).toHaveLength(6))
  it('contains none of the legacy fake testimonials or star strings', () => {
    const all = JSON.stringify(COPY)
    for (const bad of ['Sarah', 'Agung Pratama', 'Elena', '★★★★★']) expect(all).not.toContain(bad)
  })
  it('never hard-codes the starting price', () => expect(JSON.stringify(COPY)).not.toMatch(/Rp ?100\.000/))
  it('uses a {min} placeholder for the starting price', () => expect(t('id').trust.items.some(i => i.desc.includes('{min}'))).toBe(true))
})

import { withMin } from './copy'
describe('withMin', () => {
  it('fills the price', () => expect(withMin('Harga mulai {min}.', 'Rp 100.000')).toBe('Harga mulai Rp 100.000.'))
  it('drops ", mulai {min}" cleanly when the price is unknown', () => expect(withMin('Harga yang Anda bayar, mulai {min}.', null)).toBe('Harga yang Anda bayar.'))
  it('drops ", from {min}" in English', () => expect(withMin('The price you pay, from {min}.', null)).toBe('The price you pay.'))
})
