import type { Lang } from '@/lib/i18n'
import type { CategoryWithTreatments } from '@/lib/types'
import { t } from '@/content/copy'
import { formatRupiah } from '@/lib/price'
import { withLang } from '@/lib/links'
import { TreatmentIcon } from './TreatmentIcon'
import { TreatmentModal } from './TreatmentModal'

/** Photo shown in the treatment popup, per category. */
export const CATEGORY_IMAGE: Record<string, string> = {
  massage: '/assets/offer_massage.jpg',
  foot: '/assets/massage_service.jpg',
  facial: '/assets/offer_facial.jpg',
  ear: '/assets/wellness_split.jpg',
  body: '/assets/facial_service.jpg',
  packages: '/assets/offer_package.jpg',
}

/**
 * Full menu in the legacy row layout: one group per category, one row per duration.
 * "Reservasi" opens the treatment popup (photo + description) before the booking form; without JS it links straight there.
 */
export function TreatmentList({ lang, catalog }: { lang: Lang; catalog: CategoryWithTreatments[] }) {
  const c = t(lang).legacy.treatmentsPage
  return (
    <div className="treatment-list">
      {catalog.map(cat => {
        const treatments = cat.treatments.filter(tr => tr.prices.length > 0)
        if (!treatments.length) return null
        return (
          <section key={cat.key} id={cat.key} aria-labelledby={`cat-${cat.key}`} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2 id={`cat-${cat.key}`} className="treatment-group-label">{cat.name.toUpperCase()}</h2>
            {treatments.flatMap(tr => tr.prices.map(p => {
              const modal = { name: tr.name, desc: tr.description, dur: p.durationLabel, price: formatRupiah(p.priceIdr), img: CATEGORY_IMAGE[cat.key] ?? '/assets/hero_bali.jpg', icon: tr.icon }
              return (
                <div key={p.id} className="treatment-row">
                  <div className="t-row-icon-box" aria-hidden="true"><TreatmentIcon icon={tr.icon} /></div>
                  <div className="t-row-body">
                    <div className="t-row-head"><h3 className="t-row-name">{tr.name}</h3></div>
                    <div className="t-row-meta">{p.durationLabel} &nbsp;·&nbsp; <strong>{formatRupiah(p.priceIdr)}</strong></div>
                    {tr.description && <p className="t-row-desc">{tr.description}</p>}
                  </div>
                  <div className="t-row-right">
                    {tr.badge && <span className="t-row-badge">{tr.badge}</span>}
                    <a className="btn-book-action" href={withLang(`/booking?items=${p.id}`, lang)} data-treatment={JSON.stringify(modal)} aria-haspopup="dialog" aria-label={`${c.bookAction}: ${tr.name} ${p.durationLabel}`}>{c.bookAction}</a>
                  </div>
                </div>
              )
            }))}
          </section>
        )
      })}
      <TreatmentModal bookLabel={c.continue} closeLabel={c.close} />
    </div>
  )
}
