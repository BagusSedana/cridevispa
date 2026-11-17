import Image from 'next/image'
import type { Lang } from '@/lib/i18n'
import { t } from '@/content/copy'
import { withLang } from '@/lib/links'

/** Legacy full-screen hero. */
export function Hero({ lang }: { lang: Lang }) {
  const c = t(lang).legacy.hero
  return (
    <div className="hero-full" id="hero-section">
      <Image className="hero-full-img" src="/assets/hero_bali.jpg" alt="CrideviSPA — Home Service Massage Bali" fill priority sizes="100vw" />
      <div className="hero-full-overlay" aria-hidden="true" />
      <div className="hero-container container-wide">
        <div className="hero-center-content">
          <span className="hero-eyebrow">{c.eyebrow}<span className="hero-eyebrow-sub">{c.eyebrowSub}</span></span>
          <h1 className="hero-title">{c.title}<br /><em>{c.titleEm}</em></h1>
          <span className="hero-line" aria-hidden="true" />
          <p className="hero-sub">Relax &nbsp;·&nbsp; Renew &nbsp;·&nbsp; Rejuvenate</p>
          <div className="hero-ctas">
            <a className="btn-primary" href={withLang('/treatments', lang)}>{c.book}</a>
            <a className="btn-ghost" href={withLang('/treatments', lang)}>{c.treatments}</a>
          </div>
        </div>
      </div>
      <div className="hero-scroll" aria-hidden="true">
        <span className="hero-scroll-line" />
        <span>Scroll</span>
      </div>
    </div>
  )
}
