import { describe, it, expect } from 'vitest'
import { slugify } from './slug'

describe('slugify', () => {
  it('basic title', () => expect(slugify('5 Manfaat Pijat Bali!')).toBe('5-manfaat-pijat-bali'))
  it('transliterates accents', () => expect(slugify('Crème Brûlée Spa')).toBe('creme-brulee-spa'))
  it('collapses separators and trims dashes', () => expect(slugify('  --Pijat  &  Lulur--  ')).toBe('pijat-lulur'))
  it('limits length to 80 without a trailing dash', () => {
    const s = slugify('a'.repeat(79) + ' bbbb')
    expect(s.length).toBeLessThanOrEqual(80)
    expect(s.endsWith('-')).toBe(false)
  })
})
