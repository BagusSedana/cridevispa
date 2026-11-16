import type { Metadata } from 'next'
import { getLang } from '@/lib/i18n'
import { getCatalogSafe } from '@/lib/catalog'
import { t } from '@/content/copy'
import { pageMetadata } from '@/lib/metadata'
import { waLink, withLang } from '@/lib/links'
import { jsonLdString } from '@/lib/business-jsonld'
import { SITE_URL } from '@/lib/seo'
import { SiteShell } from '@/components/site/SiteShell'
import { TreatmentList } from '@/components/site/TreatmentList'
import s from '@/components/site/treatments.module.css'

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const lang = getLang(await searchParams)
  const c = t(lang).treatments
  return pageMetadata({ path: '/treatments', lang, title: c.pageTitle, description: c.pageDesc, image: '/assets/offer_massage.jpg' })
}

export default async function TreatmentsPage({ searchParams }: Props) {
  const sp = await searchParams
  const lang = getLang(sp)
  const c = t(lang).treatments
  const catalog = (await getCatalogSafe(lang)) ?? []
  const wanted = typeof sp.kategori === 'string' ? sp.kategori : null
  const active = wanted && catalog.some(cat => cat.key === wanted) ? wanted : null
  const shown = active ? catalog.filter(cat => cat.key === active) : catalog

  const offers = {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: c.pageTitle,
    url: `${SITE_URL}/treatments`,
    itemListElement: catalog.flatMap(cat => cat.treatments.flatMap(tr => tr.prices.map(p => ({
      '@type': 'Offer', price: p.priceIdr, priceCurrency: 'IDR',
      itemOffered: { '@type': 'Service', name: `${tr.name} (${p.durationLabel})`, provider: { '@type': 'HealthAndBeautyBusiness', name: 'CrideviSPA' } },
    })))),
  }

  return (
    <SiteShell lang={lang} path="/treatments">
      {catalog.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(offers) }} />}
      <div className={s.page}>
        <p className="label" style={{ fontSize: 12, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--gold-ink)', fontWeight: 600 }}>CrideviSPA</p>
        <h1>{c.pageTitle}</h1>
        <p className={s.intro}>{c.pageDesc}</p>
        {catalog.length === 0 && <p>{c.empty} <a href={waLink(lang)} target="_blank" rel="noopener noreferrer">WhatsApp</a></p>}
        {catalog.length > 0 && (
          <nav className={s.filters} aria-label={c.label}>
            <a href={withLang('/treatments', lang)} aria-current={active ? undefined : 'page'}>{c.all}</a>
            {catalog.map(cat => <a key={cat.key} href={withLang(`/treatments?kategori=${cat.key}`, lang)} aria-current={active === cat.key ? 'page' : undefined}>{cat.name}</a>)}
          </nav>
        )}
        <TreatmentList lang={lang} catalog={shown} />
      </div>
    </SiteShell>
  )
}
