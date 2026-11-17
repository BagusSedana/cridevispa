import Image from 'next/image'
import type { Lang } from '@/lib/i18n'
import type { ArticleSummary, CategoryWithTreatments } from '@/lib/types'
import { t, withMin } from '@/content/copy'
import { formatRupiah } from '@/lib/price'
import { waLink, withLang } from '@/lib/links'
import { Reveal } from '@/components/site/Reveal'
import site from '@/components/site/site.module.css'
import s from './home.module.css'

export const CATEGORY_IMAGE: Record<string, string> = {
  massage: '/assets/offer_massage.jpg',
  foot: '/assets/massage_service.jpg',
  facial: '/assets/offer_facial.jpg',
  ear: '/assets/wellness_split.jpg',
  body: '/assets/facial_service.jpg',
  packages: '/assets/offer_package.jpg',
}

export function Trust({ lang, min }: { lang: Lang; min: string | null }) {
  const c = t(lang).trust
  return (
    <section className={s.section} aria-labelledby="trust-title">
      <Reveal className={s.inner}>
        <p className={s.label}>{c.label}</p>
        <h2 id="trust-title" className={s.title}>{c.title}</h2>
        <ul className={s.trustGrid}>
          {c.items.map(item => (
            <li key={item.title} className={s.trustItem}>
              <h3>{item.title}</h3>
              <p>{withMin(item.desc, min)}</p>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  )
}

export function TreatmentCards({ lang, catalog }: { lang: Lang; catalog: CategoryWithTreatments[] | null }) {
  const c = t(lang).treatments
  return (
    <section id="treatments" className={`${s.section} ${s.cream2}`} aria-labelledby="treatments-title">
      <Reveal className={s.inner}>
        <p className={s.label}>{c.label}</p>
        <h2 id="treatments-title" className={s.title}>{c.title}</h2>
        {!catalog?.length && <p>{c.empty} <a href={waLink(lang)} target="_blank" rel="noopener noreferrer">WhatsApp</a></p>}
        <div className={s.cards}>
          {(catalog ?? []).map(cat => {
            const rows = cat.treatments.flatMap(tr => tr.prices.map(p => ({ id: p.id, name: tr.name, duration: p.durationLabel, price: p.priceIdr })))
            if (!rows.length) return null
            return (
              <article key={cat.key} className={s.card}>
                <Image className={s.cardImg} src={CATEGORY_IMAGE[cat.key] ?? '/assets/hero_bali.jpg'} alt="" width={600} height={450} sizes="(min-width: 900px) 33vw, 100vw" />
                <div className={s.cardBody}>
                  <h3>{cat.name}</h3>
                  <ul className={s.priceList}>
                    {rows.slice(0, 3).map(r => <li key={r.id}><span>{r.name}<small>{r.duration}</small></span><strong>{formatRupiah(r.price)}</strong></li>)}
                  </ul>
                  {rows.length > 3 && <p className={s.more}>{c.more.replace('{n}', String(rows.length - 3))}</p>}
                  <a className={`${site.btn} ${site.btnDark}`} href={withLang(`/treatments?kategori=${cat.key}`, lang)}>{c.pick}</a>
                </div>
              </article>
            )
          })}
        </div>
        <div className={s.seeAll}><a className={`${site.btn} ${site.btnGold}`} href={withLang('/treatments', lang)}>{c.seeAll}</a></div>
      </Reveal>
    </section>
  )
}

export function Process({ lang }: { lang: Lang }) {
  const c = t(lang).process
  return (
    <section className={`${s.section} ${s.dark2}`} aria-labelledby="process-title">
      <Reveal className={s.inner}>
        <p className={s.label}>{c.label}</p>
        <h2 id="process-title" className={s.title}>{c.title}</h2>
        <ol className={s.steps} style={{ listStyle: 'none', padding: 0 }}>
          {c.steps.map(step => <li key={step.title} className={s.step}><h3>{step.title}</h3><p>{step.desc}</p></li>)}
        </ol>
      </Reveal>
    </section>
  )
}

export function Area({ lang }: { lang: Lang }) {
  const c = t(lang).area
  return (
    <section id="lokasi" className={s.section} aria-labelledby="area-title">
      <Reveal className={`${s.inner} ${s.areaGrid}`}>
        <div>
          <p className={s.label}>{c.label}</p>
          <h2 id="area-title" className={s.title}>{c.title}</h2>
          <p className={s.lead}>{c.desc}</p>
          <ul className={s.facts}>
            <li><strong>{c.hoursLabel}</strong>{c.hours}</li>
            <li>{c.lastBooking}</li>
          </ul>
          <a className={`${site.btn} ${site.btnDark}`} href={withLang('/lokasi', lang)}>{c.more}</a>
        </div>
        <Image className={s.areaImg} src="/assets/wellness_split.jpg" alt="" width={800} height={600} sizes="(min-width: 900px) 50vw, 100vw" />
      </Reveal>
    </section>
  )
}

export function Faq({ lang }: { lang: Lang }) {
  const c = t(lang).faq
  return (
    <section id="faq" className={`${s.section} ${s.cream2}`} aria-labelledby="faq-title">
      <Reveal className={`${s.inner} ${s.center}`}>
        <p className={s.label}>{c.label}</p>
        <h2 id="faq-title" className={s.title}>{c.title}</h2>
      </Reveal>
      <div className={s.faq}>
        {c.items.map(item => <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}
        <p style={{ marginTop: 24, textAlign: 'center' }}><a className={`${site.btn} ${site.btnDark}`} href={waLink(lang)} target="_blank" rel="noopener noreferrer">{c.ask}</a></p>
      </div>
    </section>
  )
}

export function LatestArticles({ lang, articles }: { lang: Lang; articles: ArticleSummary[] }) {
  if (!articles.length) return null
  const c = t(lang).articles
  return (
    <section className={s.section} aria-labelledby="articles-title">
      <Reveal className={s.inner}>
        <p className={s.label}>{c.label}</p>
        <h2 id="articles-title" className={s.title}>{c.title}</h2>
        <div className={s.articles}>
          {articles.slice(0, 3).map(a => (
            <a key={a.slug} className={s.article} href={withLang(`/artikel/${a.slug}`, lang)}>
              {a.category && <span className={s.label}>{a.category}</span>}
              <h3>{a.title}</h3>
              <p>{a.excerpt}</p>
            </a>
          ))}
        </div>
        <div className={s.seeAll}><a className={`${site.btn} ${site.btnDark}`} href={withLang('/artikel', lang)}>{c.all}</a></div>
      </Reveal>
    </section>
  )
}

export function ClosingCta({ lang }: { lang: Lang }) {
  const c = t(lang).cta
  return (
    <section className={`${s.section} ${s.dark}`} aria-labelledby="cta-title">
      <Reveal className={`${s.inner} ${s.closing}`}>
        <h2 id="cta-title" className={s.title}>{c.title}</h2>
        <p className={s.lead} style={{ margin: '0 auto' }}>{c.desc}</p>
        <p className={s.heroSub} style={{ marginTop: 16 }}>{t(lang).area.hours} · {t(lang).area.title}</p>
        <div className={s.ctas}>
          <a className={`${site.btn} ${site.btnGold}`} href={waLink(lang)} target="_blank" rel="noopener noreferrer">{c.book}</a>
          <a className={`${site.btn} ${site.btnGhost}`} href={withLang('/treatments', lang)}>{c.pick}</a>
        </div>
      </Reveal>
    </section>
  )
}
