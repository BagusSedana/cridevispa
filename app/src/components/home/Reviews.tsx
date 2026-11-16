import type { Lang } from '@/lib/i18n'
import type { Review } from '@/lib/reviews'
import { t } from '@/content/copy'
import s from './home.module.css'

/** Real reviews only. Renders nothing while there are none (spec: no placeholders, no fake reviews). */
export function Reviews({ lang, items }: { lang: Lang; items: Review[] }) {
  if (!items.length) return null
  const c = t(lang).reviews
  return (
    <section className={`${s.section} ${s.cream2}`} aria-labelledby="reviews-title">
      <div className={`${s.inner} ${s.center}`}>
        <p className={s.label}>{c.label}</p>
        <h2 id="reviews-title" className={s.title}>{c.title}</h2>
        <div className={s.reviews}>
          {items.map(r => (
            <figure key={r.id} className={s.review}>
              <div className={s.stars} aria-label={`${r.rating}/5`}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
              <blockquote>“{r.text}”</blockquote>
              <figcaption className={s.reviewer}><strong>{r.name}</strong>{[r.origin, r.treatment].filter(Boolean).length ? ` · ${[r.origin, r.treatment].filter(Boolean).join(' · ')}` : ''}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
