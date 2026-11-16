import { config } from 'dotenv'
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'
config({ path: '.env.local' })
const ready = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)

describe.skipIf(!ready)('POST /api/bookings', () => {
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
  const marker = `Route Test ${Date.now()}`
  let priceId = ''
  let priceIdr = 0
  let POST: (r: Request) => Promise<Response>
  let resetRateLimit: () => void

  const body = (over: Record<string, unknown> = {}) => ({
    name: marker, phone: '0812-3456 7890', date: '2030-01-01', time: '10:00', lang: 'id',
    items: [{ treatmentPriceId: priceId, priceIdr: 1 }], ...over,
  })
  const call = (b: unknown, ip = '10.0.0.1') => POST(new Request('http://localhost/api/bookings', {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': ip }, body: JSON.stringify(b),
  }))

  beforeAll(async () => {
    ;({ POST } = await import('./route'))
    ;({ resetRateLimit } = await import('@/lib/booking/rate-limit'))
    const { data } = await db.from('treatment_prices').select('id,price_idr,treatments!inner(name,is_active)').eq('treatments.name', 'Balinese Massage').eq('duration_minutes', 60).single()
    priceId = data!.id; priceIdr = data!.price_idr
  })
  beforeEach(() => resetRateLimit())
  afterAll(async () => { await db.from('bookings').delete().eq('name', marker) })

  it('creates a booking with the server price, ignoring the client price', async () => {
    const res = await call(body())
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.waUrl).toContain('https://wa.me/6285812429650?text=')
    const { data } = await db.from('bookings').select('total_idr,phone,items').eq('id', json.id).single()
    expect(data!.total_idr).toBe(priceIdr)
    expect(data!.phone).toBe('6281234567890')
  })
  it('rejects an unknown treatmentPriceId', async () => {
    const res = await call(body({ items: [{ treatmentPriceId: '00000000-0000-4000-8000-000000000000' }] }))
    expect(res.status).toBe(400)
    expect((await res.json()).field).toBe('items')
  })
  it('rejects a past slot', async () => {
    const res = await call(body({ date: '2020-01-01' }))
    expect(res.status).toBe(400)
    expect((await res.json()).field).toBe('date')
  })
  it('rejects a bad phone', async () => {
    const res = await call(body({ phone: 'call me' }))
    expect(res.status).toBe(400)
    expect((await res.json()).field).toBe('phone')
  })
  it('honeypot: answers 201 but writes nothing', async () => {
    const res = await call(body({ name: `${marker} bot`, website: 'http://spam' }))
    expect(res.status).toBe(201)
    const { count } = await db.from('bookings').select('id', { count: 'exact', head: true }).eq('name', `${marker} bot`)
    expect(count).toBe(0)
  })
  it('rate limits the 6th request per IP within a minute', async () => {
    const bad = body({ phone: 'x' })
    for (let i = 0; i < 5; i++) expect((await call(bad, '10.9.9.9')).status).toBe(400)
    expect((await call(bad, '10.9.9.9')).status).toBe(429)
  })
  it('rejects invalid JSON', async () => {
    const res = await POST(new Request('http://localhost/api/bookings', { method: 'POST', body: '{not json' }))
    expect(res.status).toBe(400)
  })
})
