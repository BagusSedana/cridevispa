import Image from 'next/image'
import type { Lang } from '@/lib/i18n'
import type { Review } from '@/lib/reviews'
import { t } from '@/content/copy'

const initials = (name: string) => name.split(/\s+/).filter(w => /^\p{L}/u.test(w)).slice(0, 2).map(w => w[0].toUpperCase()).join('')

/** Real reviews only, in the legacy testimonial layout. Renders nothing while there are none (no placeholders, no fake reviews). */
export function Reviews({ lang, items }: { lang: Lang; items: Review[] }) {
  if (!items.length) return null
  const c = t(lang).legacy.reviews
  return (
    <section className="testimonials-section" aria-labelledby="reviews-title">
      <Image className="testimonials-bg" src="/assets/testi_bg.jpg" alt="" width={1920} height={800} sizes="100vw" />
      <div className="testimonials-inner">
        <div className="container-wide">
          <div className="testimonials-header">
            <span className="section-label center">{c.label}</span>
            <h2 id="reviews-title" className="h2-serif center">{c.title}</h2>
          </div>
          <div className="testimonials-grid">
            {items.map(r => (
              <figure key={r.id} className="testimonial-item reveal-card">
                <span className="testimonial-stars" aria-label={`${r.rating}/5`}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                <blockquote className="testimonial-text">“{r.text}”</blockquote>
                <div className="testimonial-rule" />
                <figcaption className="testimonial-user">
                  <div className="testimonial-avatar" aria-hidden="true">{initials(r.name)}</div>
                  <div>
                    <p className="testimonial-name">{r.name}</p>
                    {(r.origin || r.treatment) && <p className="testimonial-service">{[r.origin, r.treatment].filter(Boolean).join(' • ')}</p>}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
