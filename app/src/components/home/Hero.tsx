import Image from 'next/image'
import type { Lang } from '@/lib/i18n'
import { t } from '@/content/copy'
import { formatRupiah } from '@/lib/price'
import { waLink, withLang } from '@/lib/links'
import site from '@/components/site/site.module.css'
import s from './home.module.css'

/** Above-the-fold hero. No animation: text and buttons are in the first paint. */
export function Hero({ lang, min }: { lang: Lang; min: number | null }) {
  const c = t(lang).hero
  return (
    <section className={s.hero} aria-labelledby="hero-title">
      <Image className={s.heroImg} src="/assets/hero_bali.jpg" alt="" fill priority sizes="100vw" />
      <div className={s.heroBody}>
        <p className={s.eyebrow}>{c.eyebrow}</p>
        <h1 id="hero-title" className={s.heroTitle}>{c.title}<br /><em>{c.titleEm}</em></h1>
        <p className={s.heroSub}>{c.sub}</p>
        {min !== null && <p className={s.price}>{c.price.replace('{min}', formatRupiah(min))}</p>}
        <div className={s.ctas} style={min === null ? { marginTop: 24 } : undefined}>
          <a className={`${site.btn} ${site.btnGold}`} href={waLink(lang)} target="_blank" rel="noopener noreferrer">{c.book}</a>
          <a className={`${site.btn} ${site.btnGhost}`} href={withLang('/treatments', lang)}>{c.prices}</a>
        </div>
      </div>
    </section>
  )
}
