import type { Lang } from '@/lib/i18n'
import type { CategoryWithTreatments } from '@/lib/types'
import { t } from '@/content/copy'
import { formatRupiah } from '@/lib/price'
import { withLang } from '@/lib/links'
import s from './treatments.module.css'

/** Full menu: one block per category, one row per treatment, one "Pilih" per duration. Empty treatments/categories are skipped. */
export function TreatmentList({ lang, catalog }: { lang: Lang; catalog: CategoryWithTreatments[] }) {
  const c = t(lang).treatments
  return (
    <>
      {catalog.map(cat => {
        const treatments = cat.treatments.filter(tr => tr.prices.length > 0)
        if (!treatments.length) return null
        return (
          <section key={cat.key} id={cat.key} className={s.category} aria-labelledby={`cat-${cat.key}`}>
            <h2 id={`cat-${cat.key}`}>{cat.name}</h2>
            {treatments.map(tr => (
              <article key={tr.id} className={s.treatment}>
                <div className={s.head}>
                  <h3>{tr.name}</h3>
                  {tr.badge && <span className={s.badge}>{tr.badge}</span>}
                </div>
                {tr.description && <p className={s.desc}>{tr.description}</p>}
                <ul className={s.prices}>
                  {tr.prices.map(p => (
                    <li key={p.id}>
                      <span>{p.durationLabel}</span>
                      <strong>{formatRupiah(p.priceIdr)}</strong>
                      <a className={s.pick} href={withLang(`/booking?items=${p.id}`, lang)} aria-label={`${c.pick}: ${tr.name} ${p.durationLabel}`}>{c.pick}</a>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </section>
        )
      })}
    </>
  )
}
