// Idempotent seed: npx tsx scripts/seed.ts  (needs app/.env.local with the service-role key)
import { config } from 'dotenv'
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { legacyToRows } from './transform'
import { LEGACY_TREATMENTS, LEGACY_ARTICLES } from './legacy-data'

config({ path: '.env.local' })
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
})

async function must<T>(p: PromiseLike<{ data: T | null; error: unknown }>): Promise<T> {
  const { data, error } = await p
  if (error) throw error
  return data as T
}

async function main() {
  const { categories, treatments, prices } = legacyToRows(LEGACY_TREATMENTS)

  const cats = await must(db.from('categories').upsert(categories, { onConflict: 'key' }).select('id,key'))
  const catId = Object.fromEntries(cats.map(c => [c.key, c.id]))

  const tRows = treatments.map(({ categoryKey, ...t }) => ({ ...t, category_id: catId[categoryKey] }))
  const saved = await must(db.from('treatments').upsert(tRows, { onConflict: 'category_id,name' }).select('id,name,category_id'))
  const tId = (catKey: string, name: string) => saved.find(s => s.name === name && s.category_id === catId[catKey])!.id

  const ids = saved.map(s => s.id)
  await must(db.from('treatment_prices').delete().in('treatment_id', ids))
  await must(db.from('treatment_prices').insert(prices.map(({ treatmentName, categoryKey, ...p }) => ({ ...p, treatment_id: tId(categoryKey, treatmentName) }))))

  const [first, second] = LEGACY_ARTICLES
  await must(db.from('articles').upsert([
    {
      slug: 'manfaat-pijat-bali',
      title_id: first.title_id, title_en: first.title_en,
      excerpt_id: first.excerpt_id, excerpt_en: first.excerpt_en,
      body_id: '', body_en: readFileSync('scripts/articles/manfaat-pijat-bali.en.md', 'utf8'),
      category: first.category, author: first.author,
      published: true, published_at: new Date(first.date).toISOString(),
      meta_description_id: first.excerpt_id, meta_description_en: first.excerpt_en,
    },
    {
      slug: 'facial-rutin-iklim-tropis-bali',
      title_id: second.title_id, title_en: second.title_en,
      excerpt_id: second.excerpt_id, excerpt_en: second.excerpt_en,
      body_id: '', body_en: '', category: second.category, author: second.author, published: false,
      published_at: null, meta_description_id: second.excerpt_id, meta_description_en: second.excerpt_en,
    },
  ], { onConflict: 'slug' }))

  console.log(`Seeded ${cats.length} categories, ${saved.length} treatments, ${prices.length} prices, 2 articles.`)
}

main().catch(e => { console.error(e); process.exit(1) })
