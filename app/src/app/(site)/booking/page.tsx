import type { Metadata } from 'next'
import { getCatalogSafe } from '@/lib/catalog'
import { getLang } from '@/lib/i18n'
import { t } from '@/content/copy'
import { waLink } from '@/lib/links'
import { parsePreselected } from '@/lib/booking/preselect'
import { SiteShell } from '@/components/site/SiteShell'
import { BookingForm } from './BookingForm'

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const c = t(getLang(await searchParams)).booking
  return { title: c.title, description: c.desc, robots: { index: false, follow: true } }
}

export default async function BookingPage({ searchParams }: Props) {
  const sp = await searchParams
  const lang = getLang(sp)
  const c = t(lang).booking
  const catalog = (await getCatalogSafe(lang)) ?? []
  const valid = new Set(catalog.flatMap(cat => cat.treatments.flatMap(tr => tr.prices.map(p => p.id))))
  const initialIds = parsePreselected(sp.items, valid)
  return (
    <SiteShell lang={lang} path="/booking">
      <div className="booking-wrap container-wide">
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <h1 className="h2-serif" style={{ marginBottom: 12 }}>{c.title}</h1>
          <p style={{ fontSize: 14, color: 'var(--text-mid)' }}>{c.desc}</p>
        </div>
        {catalog.length
          ? <BookingForm catalog={catalog} lang={lang} initialIds={initialIds} />
          : <p>{t(lang).treatments.empty} <a href={waLink(lang)} target="_blank" rel="noopener noreferrer">WhatsApp</a></p>}
      </div>
    </SiteShell>
  )
}
