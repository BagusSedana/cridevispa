import { z } from 'zod'

export const OPEN_TIME = '07:00'
export const LAST_BOOKING_TIME = '22:00'
const WITA_OFFSET = '+08:00'

/**
 * Phone → international digits without "+" (E.164), or null.
 * Local Indonesian forms (08…, 8…) become 62…; "+…" and "00…" are kept as international.
 */
export function normalizePhone(input: string): string | null {
  const trimmed = input.trim()
  if (/[^0-9+\-\s().]/.test(trimmed)) return null
  let digits = trimmed.replace(/\D/g, '')
  if (trimmed.startsWith('+')) { /* already international */ }
  else if (digits.startsWith('00')) digits = digits.slice(2)
  else if (digits.startsWith('0')) digits = '62' + digits.slice(1)
  else if (digits.startsWith('8')) digits = '62' + digits
  return /^[1-9][0-9]{7,14}$/.test(digits) ? digits : null
}

/** True when date+time (WITA) is in the future and inside 07:00–22:00. */
export function isBookableSlot(date: string, time: string, now: Date = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return false
  if (time < OPEN_TIME || time > LAST_BOOKING_TIME) return false
  const slot = new Date(`${date}T${time}:00${WITA_OFFSET}`)
  return !Number.isNaN(slot.getTime()) && slot.getTime() > now.getTime()
}

export const bookingInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(6).max(30),
  email: z.string().trim().email().max(200).optional().or(z.literal('')),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  message: z.string().trim().max(1000).optional().default(''),
  lang: z.enum(['id', 'en']).default('id'),
  items: z.array(z.object({ treatmentPriceId: z.string().uuid() })).min(1).max(10),
  website: z.string().optional(), // honeypot: real users leave it empty
})
export type BookingInput = z.infer<typeof bookingInputSchema>
