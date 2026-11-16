// Integration test against the real Supabase project. Needs app/.env.local.
import 'dotenv/config'
import { config } from 'dotenv'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const ready = Boolean(url && anonKey && serviceKey)

describe.skipIf(!ready)('row level security (anon key)', () => {
  const anon = createClient(url, anonKey, { auth: { persistSession: false } })
  const service = createClient(url, serviceKey, { auth: { persistSession: false } })
  const slug = `rls-test-draft-${Date.now()}`
  let categoryId = ''
  let inactiveId = ''

  beforeAll(async () => {
    const cat = await service.from('categories').upsert({ key: 'rls-test', name_id: 'Tes', name_en: 'Test' }, { onConflict: 'key' }).select('id').single()
    categoryId = cat.data!.id
    const t = await service.from('treatments').insert({ category_id: categoryId, name: `Inactive ${Date.now()}`, is_active: false }).select('id').single()
    inactiveId = t.data!.id
    await service.from('articles').insert({ slug, title_id: 'Draft', published: false })
  })

  afterAll(async () => {
    await service.from('articles').delete().eq('slug', slug)
    await service.from('treatments').delete().eq('id', inactiveId)
    await service.from('categories').delete().eq('id', categoryId)
  })

  it('cannot read bookings', async () => {
    const { data } = await anon.from('bookings').select('id')
    expect(data ?? []).toHaveLength(0)
  })
  it('cannot insert bookings', async () => {
    const { error } = await anon.from('bookings').insert({ name: 'x', phone: '6281234567890', booking_date: '2030-01-01', booking_time: '10:00', items: [], total_idr: 0 })
    expect(error).not.toBeNull()
  })
  it('cannot insert treatments', async () => {
    const { error } = await anon.from('treatments').insert({ category_id: categoryId, name: 'Hack' })
    expect(error).not.toBeNull()
  })
  it('does not see unpublished articles', async () => {
    const { data } = await anon.from('articles').select('slug').eq('slug', slug)
    expect(data ?? []).toHaveLength(0)
  })
  it('does not see inactive treatments', async () => {
    const { data } = await anon.from('treatments').select('id').eq('id', inactiveId)
    expect(data ?? []).toHaveLength(0)
  })
})
