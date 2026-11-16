import { NextResponse } from 'next/server'
import { getCatalog } from '@/lib/catalog'
import { getLang } from '@/lib/i18n'

export type CatalogRow = { treatmentPriceId: string; name: string; category: string; durationMinutes: number | null; durationLabel: string; priceIdr: number }

/** Flat list of bookable options; used by the legacy static site to map its form to price ids. */
export async function GET(request: Request): Promise<Response> {
  const lang = getLang(Object.fromEntries(new URL(request.url).searchParams))
  const catalog = await getCatalog(lang)
  const rows: CatalogRow[] = catalog.flatMap(c => c.treatments.flatMap(t => t.prices.map(p => ({
    treatmentPriceId: p.id, name: t.name, category: c.key, durationMinutes: p.durationMinutes, durationLabel: p.durationLabel, priceIdr: p.priceIdr,
  }))))
  return NextResponse.json(rows, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } })
}
