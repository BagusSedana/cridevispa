import { config } from 'dotenv'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'
config({ path: '.env.local' })
const ready = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)

describe.skipIf(!ready)('reviews RLS', () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } })
  const service = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
  const tag = `RLS Test ${Date.now()}`
  beforeAll(async () => {
    const { error } = await service.from('reviews').insert([
      { name: `${tag} pub`, rating: 5, text_id: 'ok', published: true },
      { name: `${tag} draft`, rating: 4, text_id: 'ok', published: false },
    ])
    if (error) throw new Error('reviews table missing — run migration 004: ' + error.message)
  })
  afterAll(async () => { await service.from('reviews').delete().like('name', `${tag}%`) })

  it('positive control: anon reads a published review', async () => {
    const { data } = await anon.from('reviews').select('name').eq('name', `${tag} pub`)
    expect(data).toHaveLength(1)
  })
  it('anon cannot read an unpublished review', async () => {
    const { data } = await anon.from('reviews').select('name').eq('name', `${tag} draft`)
    expect(data ?? []).toHaveLength(0)
  })
  it('anon cannot insert a review', async () => {
    const { error } = await anon.from('reviews').insert({ name: 'spam', rating: 5, text_id: 'x', published: true })
    expect(error).not.toBeNull()
  })
})
