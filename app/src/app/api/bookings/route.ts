import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/admin'
import { bookingInputSchema, isBookableSlot, normalizePhone } from '@/lib/booking/schema'
import { buildWaMessage, buildWaUrl } from '@/lib/booking/whatsapp'
import { allowRequest } from '@/lib/booking/rate-limit'
import { durationLabel } from '@/lib/catalog'

const bad = (error: string, field?: string) => NextResponse.json({ error, field }, { status: 400 })

export async function POST(request: Request): Promise<Response> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!allowRequest(`booking:${ip}`)) return NextResponse.json({ error: 'Terlalu banyak permintaan. Coba lagi sebentar.' }, { status: 429 })

  let raw: unknown
  try { raw = await request.json() } catch { return bad('Format data tidak valid.') }

  const parsed = bookingInputSchema.safeParse(raw)
  if (!parsed.success) return bad('Data booking tidak lengkap atau tidak valid.', String(parsed.error.issues[0]?.path[0] ?? ''))
  const input = parsed.data

  if (input.website) return NextResponse.json({ id: 'ok', waUrl: buildWaUrl('') }, { status: 201 })

  const phone = normalizePhone(input.phone)
  if (!phone) return bad('Nomor HP tidak valid.', 'phone')
  if (!isBookableSlot(input.date, input.time)) return bad('Tanggal/jam tidak tersedia (buka 07:00–22:00 WITA).', 'date')

  const db = createServiceClient()
  const ids = [...new Set(input.items.map(i => i.treatmentPriceId))]
  const { data: prices, error } = await db
    .from('treatment_prices')
    .select('id,duration_minutes,duration_label_id,duration_label_en,price_idr,treatments!inner(name,is_active)')
    .in('id', ids)
    .eq('treatments.is_active', true)
  if (error) return NextResponse.json({ error: 'Server sedang bermasalah.' }, { status: 500 })
  if (!prices || prices.length !== ids.length) return bad('Treatment tidak ditemukan.', 'items')

  const byId = new Map(prices.map(p => [p.id, p]))
  const items = input.items.map(i => {
    const p = byId.get(i.treatmentPriceId)!
    const t = p.treatments as unknown as { name: string }
    return {
      treatmentPriceId: p.id, name: t.name, priceIdr: p.price_idr, durationMinutes: p.duration_minutes,
      durationLabel: durationLabel(p.duration_minutes, p.duration_label_id, p.duration_label_en, input.lang),
    }
  })
  const totalIdr = items.reduce((n, i) => n + i.priceIdr, 0)

  const { data: row, error: insertError } = await db.from('bookings').insert({
    name: input.name, phone, email: input.email || null, address_note: input.message || null,
    booking_date: input.date, booking_time: input.time, lang: input.lang, items, total_idr: totalIdr,
  }).select('id').single()
  if (insertError) return NextResponse.json({ error: 'Server sedang bermasalah.' }, { status: 500 })

  const waUrl = buildWaUrl(buildWaMessage(input.lang, {
    name: input.name, phone: input.phone, date: input.date, time: input.time, message: input.message, items, totalIdr,
  }))
  return NextResponse.json({ id: row.id, waUrl }, { status: 201 })
}
