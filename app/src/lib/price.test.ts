import { describe, it, expect } from 'vitest'
import { formatRupiah } from './price'

describe('formatRupiah', () => {
  it('formats 250000', () => expect(formatRupiah(250000)).toBe('Rp 250.000'))
  it('formats 1250000', () => expect(formatRupiah(1250000)).toBe('Rp 1.250.000'))
  it('formats 0', () => expect(formatRupiah(0)).toBe('Rp 0'))
})
