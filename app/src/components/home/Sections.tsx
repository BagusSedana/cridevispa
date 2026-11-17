import Image from 'next/image'
import type { Lang } from '@/lib/i18n'
import type { CategoryWithTreatments } from '@/lib/types'
import { t, withMin } from '@/content/copy'
import { formatRupiah } from '@/lib/price'
import { waLink, withLang } from '@/lib/links'
import { WaIcon } from '@/components/site/SiteShell'

function TwoLine({ title, em }: { title: string; em: string }) {
  return <>{title}<br /><em>{em}</em></>
}

export function Intro({ lang }: { lang: Lang }) {
  const c = t(lang).legacy.intro
  return (
    <section className="intro-section reveal" aria-labelledby="intro-title">
      <div className="container-wide">
        <div className="intro-inner">
          <span className="section-label center">{c.label}</span>
          <h2 id="intro-title" className="h2-serif center"><TwoLine title={c.title} em={c.titleEm} /></h2>
          <div className="gold-rule" style={{ justifyContent: 'center', maxWidth: 200, margin: '20px auto 0' }}><span /></div>
          <p className="intro-body">{c.body}</p>
        </div>
      </div>
    </section>
  )
}

export function Split({ lang }: { lang: Lang }) {
  const c = t(lang).legacy.split
  return (
    <section className="split-section reveal" aria-labelledby="split-title">
      <div className="split-img">
        <Image src="/assets/wellness_split.jpg" alt="" width={800} height={560} sizes="(min-width: 900px) 50vw, 100vw" />
      </div>
      <div className="split-text">
        <span className="section-label">{c.label}</span>
        <h2 id="split-title" className="h2-serif"><TwoLine title={c.title} em={c.titleEm} /></h2>
        <p>{c.desc}</p>
        <a className="btn-solid" href={withLang('/treatments', lang)}>{c.btn}</a>
      </div>
    </section>
  )
}

export function Trust({ lang, min }: { lang: Lang; min: string | null }) {
  const c = t(lang).legacy.trust
  const items = t(lang).trust.items
  return (
    <section className="services-section reveal" aria-labelledby="trust-title">
      <div className="container-wide">
        <div className="services-header">
          <span className="section-label center">{c.label}</span>
          <h2 id="trust-title" className="h2-serif center"><TwoLine title={c.title} em={c.titleEm} /></h2>
          <p>{c.desc}</p>
        </div>
        <div className="services-grid">
          {items.map((item, i) => (
            <div key={item.title} className="service-item reveal-card">
              <span className="service-num">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="service-title">{item.title}</h3>
              <p className="service-desc">{withMin(item.desc, min)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const FEATURED = [
  { key: 'massage', keys: ['massage', 'foot'], image: '/assets/offer_massage.jpg', link: 'massage' },
  { key: 'care', keys: ['facial', 'ear', 'body'], image: '/assets/offer_facial.jpg', link: 'facial' },
  { key: 'packages', keys: ['packages'], image: '/assets/offer_package.jpg', link: 'packages' },
] as const

export function FeaturedTreatments({ lang, catalog }: { lang: Lang; catalog: CategoryWithTreatments[] | null }) {
  const c = t(lang).legacy.featured
  const cards = FEATURED.map(f => {
    const treatments = (catalog ?? []).filter(cat => (f.keys as readonly string[]).includes(cat.key)).flatMap(cat => cat.treatments).filter(tr => tr.prices.length)
    const prices = treatments.flatMap(tr => tr.prices.map(p => p.priceIdr))
    const names = [...new Set(treatments.map(tr => tr.name))]
    return { ...f, names, min: prices.length ? Math.min(...prices) : null }
  }).filter(card => card.names.length)
  if (!cards.length) return null
  return (
    <section className="treatments-home-section reveal" id="homepage-treatments" aria-labelledby="featured-title">
      <div className="container-wide">
        <div className="treatments-header">
          <div>
            <span className="section-label">{c.label}</span>
            <h2 id="featured-title" className="h2-serif"><TwoLine title={c.title} em={c.titleEm} /></h2>
          </div>
          <a className="btn-split" href={withLang('/treatments', lang)}>{c.seeAll}</a>
        </div>
        <div className="cards-3-grid">
          {cards.map(card => (
            <a key={card.key} className="treatment-card reveal-card" href={withLang(`/treatments?kategori=${card.link}`, lang)}>
              <div className="treatment-card-img">
                <Image src={card.image} alt="" width={400} height={260} sizes="(min-width: 900px) 33vw, 100vw" />
              </div>
              <div className="treatment-card-body">
                <span className="treatment-card-cat">{c[`${card.key}Cat`]}</span>
                <h3 className="treatment-card-name">{c[card.key]}</h3>
                <p className="treatment-card-text">{card.names.slice(0, 5).join(', ')}.</p>
                {card.min !== null && <span className="treatment-card-price">{c.from.replace('{price}', formatRupiah(card.min))}</span>}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Banner({ lang }: { lang: Lang }) {
  const c = t(lang).legacy.banner
  return (
    <section className="banner-section reveal" aria-labelledby="banner-title">
      <Image className="banner-bg" src="/assets/massage_service.jpg" alt="" width={1920} height={520} sizes="100vw" />
      <div className="banner-overlay" aria-hidden="true" />
      <div className="container-wide" style={{ width: '100%' }}>
        <div className="banner-content">
          <span className="banner-pretitle">{c.pre}</span>
          <h2 id="banner-title" className="banner-title"><TwoLine title={c.title} em={c.titleEm} /></h2>
          <p className="banner-sub">{c.sub}</p>
          <a className="btn-primary" href={withLang('/treatments', lang)}>{c.btn}</a>
        </div>
      </div>
    </section>
  )
}

/** One row per treatment with its lowest price, like the legacy home price list. */
export function PriceList({ lang, catalog }: { lang: Lang; catalog: CategoryWithTreatments[] | null }) {
  const c = t(lang).legacy.priceList
  const rows = (catalog ?? []).flatMap(cat => cat.treatments).filter(tr => tr.prices.length).map(tr => {
    const cheapest = tr.prices.reduce((a, b) => (b.priceIdr < a.priceIdr ? b : a))
    return { id: tr.id, name: tr.name, duration: cheapest.durationLabel, price: cheapest.priceIdr }
  })
  if (!rows.length) return null
  return (
    <section className="pricelist-section reveal" id="price-preview" aria-labelledby="price-title">
      <div className="container-wide">
        <div className="pricelist-header">
          <span className="section-label center">{c.label}</span>
          <h2 id="price-title" className="h2-serif center"><TwoLine title={c.title} em={c.titleEm} /></h2>
        </div>
        <div className="homepage-treatments-grid">
          {rows.map(r => (
            <a key={r.id} className="home-treat-item" href={withLang('/treatments', lang)}>
              <div className="home-treat-left">
                <div className="home-treat-name">{r.name}</div>
                <div className="home-treat-dur">{r.duration}</div>
              </div>
              <span className="home-treat-price">{formatRupiah(r.price)}</span>
            </a>
          ))}
        </div>
        <div className="grid-cta-wrapper">
          <a className="btn-split" href={withLang('/treatments', lang)}>{c.full}</a>
        </div>
      </div>
    </section>
  )
}

const STEP_ICONS = [
  <svg key="1" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  <svg key="2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 1 0-16 0" /></svg>,
  <svg key="3" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" stroke="none" fill="currentColor" /></svg>,
  <svg key="4" viewBox="0 0 24 24" aria-hidden="true"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
]

export function Process({ lang }: { lang: Lang }) {
  const c = t(lang).legacy.process
  const steps = t(lang).process.steps
  return (
    <section className="process-section" aria-labelledby="process-title">
      <div className="process-image-panel">
        <Image src="/assets/process_bg.jpg" alt="" width={800} height={800} sizes="(min-width: 900px) 50vw, 100vw" />
        <div className="process-image-overlay" aria-hidden="true" />
      </div>
      <div className="process-content-panel">
        <div className="process-header reveal">
          <span className="section-label">{c.label}</span>
          <h2 id="process-title" className="h2-serif"><TwoLine title={c.title} em={c.titleEm} /></h2>
        </div>
        <div className="process-steps">
          {steps.map((step, i) => (
            <div key={step.title} className="process-step-row reveal-card">
              <div className="process-step-icon">
                {STEP_ICONS[i]}
                <span className="process-step-num">{i + 1}</span>
              </div>
              <div className="process-step-body">
                <h3 className="process-step-title">{step.title}</h3>
                <p className="process-step-desc">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Faq({ lang }: { lang: Lang }) {
  const c = t(lang).faq
  const L = t(lang).legacy.faq
  return (
    <section className="faq-section" id="faq" aria-labelledby="faq-title">
      <div className="container-wide">
        <div className="faq-inner">
          <div className="faq-left reveal">
            <div className="faq-header">
              <span className="section-label">{c.label}</span>
              <h2 id="faq-title" className="h2-serif">{L.title}</h2>
            </div>
            <p className="faq-sub">{L.sub}</p>
            <a href={waLink(lang)} className="faq-badge" target="_blank" rel="noopener noreferrer">
              <WaIcon />
              {c.ask}
            </a>
          </div>
          <div className="faq-accordion reveal">
            {c.items.map((item, i) => (
              <div key={item.q} className="faq-item">
                <button className="faq-question" type="button" aria-expanded="false" aria-controls={`faq-a-${i}`}>
                  <span>{item.q}</span>
                  <span className="faq-icon" aria-hidden="true">+</span>
                </button>
                <div className="faq-answer" id={`faq-a-${i}`}>
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function ClosingCta({ lang }: { lang: Lang }) {
  const c = t(lang).legacy.cta
  return (
    <section className="cta-section reveal" aria-labelledby="cta-title">
      <div className="container-wide">
        <div className="cta-inner">
          <span className="cta-label">{c.label}</span>
          <h2 id="cta-title" className="cta-heading"><TwoLine title={c.title} em={c.titleEm} /></h2>
          <p className="cta-sub">{t(lang).cta.desc}</p>
          <p className="cta-hours">{c.hours}</p>
          <a className="btn-cta-outline" href={withLang('/treatments', lang)}>{c.btn}</a>
        </div>
      </div>
    </section>
  )
}
