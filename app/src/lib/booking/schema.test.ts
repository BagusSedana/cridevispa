import { describe, it, expect } from 'vitest'
import { normalizePhone, isBookableSlot, bookingInputSchema } from './schema'

describe('normalizePhone', () => {
  it('08… with dashes/spaces', () => expect(normalizePhone('0812-3456 789')).toBe('628123456789'))
  it('+62 …', () => expect(normalizePhone('+62 812 3456 789')).toBe('628123456789'))
  it('62…', () => expect(normalizePhone('628123456789')).toBe('628123456789'))
  it('letters → null', () => expect(normalizePhone('abc')).toBeNull())
  it('too short → null', () => expect(normalizePhone('0812')).toBeNull())
})

describe('isBookableSlot (WITA, UTC+8)', () => {
  const at = (iso: string) => new Date(iso)
  it('rejects a past date', () => expect(isBookableSlot('2026-11-15', '10:00', at('2026-11-16T02:00:00Z'))).toBe(false))
  it('rejects 22:30', () => expect(isBookableSlot('2030-01-01', '22:30', at('2026-11-16T02:00:00Z'))).toBe(false))
  it('accepts 22:00', () => expect(isBookableSlot('2030-01-01', '22:00', at('2026-11-16T02:00:00Z'))).toBe(true))
  it('rejects 06:59', () => expect(isBookableSlot('2030-01-01', '06:59', at('2026-11-16T02:00:00Z'))).toBe(false))
  it('rejects tonight 22:00 when it is already 23:30 WITA', () => expect(isBookableSlot('2026-11-16', '22:00', at('2026-11-16T15:30:00Z'))).toBe(false))
  it('accepts 08:00 today when it is 00:30 WITA (still the 15th in UTC)', () => expect(isBookableSlot('2026-11-16', '08:00', at('2026-11-15T16:30:00Z'))).toBe(true))
})

describe('bookingInputSchema', () => {
  const ok = { name: 'Ayu', phone: '081234567890', date: '2030-01-01', time: '10:00', lang: 'id', items: [{ treatmentPriceId: '00000000-0000-4000-8000-000000000000' }] }
  it('accepts a valid booking', () => expect(bookingInputSchema.safeParse(ok).success).toBe(true))
  it('rejects empty items', () => expect(bookingInputSchema.safeParse({ ...ok, items: [] }).success).toBe(false))
  it('rejects more than 10 items', () => expect(bookingInputSchema.safeParse({ ...ok, items: Array(11).fill(ok.items[0]) }).success).toBe(false))
  it('rejects a bad date format', () => expect(bookingInputSchema.safeParse({ ...ok, date: '01/01/2030' }).success).toBe(false))
})
