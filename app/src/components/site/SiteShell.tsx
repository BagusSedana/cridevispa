import Image from 'next/image'
import type { ReactNode } from 'react'
import type { Lang } from '@/lib/i18n'
import { t } from '@/content/copy'
import { CONTACT, waLink, withLang } from '@/lib/links'
import { LegacyEffects } from './LegacyEffects'
import '@/app/(site)/legacy.css'

const WA_PATH = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z'

export function WaIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={WA_PATH} /></svg>
}

/** Legacy header + footer + floating WhatsApp button around every public page. `path` = this page's path without ?lang. */
export function SiteShell({ lang, path, children }: { lang: Lang; path: string; children: ReactNode }) {
  const c = t(lang)
  const L = c.legacy
  const links = [
    { href: '/', label: c.nav.home },
    { href: '/treatments', label: c.nav.treatments },
    { href: '/lokasi', label: c.nav.location },
    { href: '/artikel', label: c.nav.articles },
  ]
  const langLinks = (['id', 'en'] as const).map((l, i) => (
    <span key={l} style={{ display: 'contents' }}>
      {i > 0 && <span className="lang-sep" aria-hidden="true">|</span>}
      <a className={`lang-btn${lang === l ? ' active' : ''}`} href={withLang(path, l)} hrefLang={l} aria-current={lang === l ? 'true' : undefined}>{l.toUpperCase()}</a>
    </span>
  ))
  return (
    <>
      <noscript><style>{'.reveal,.reveal-card{opacity:1!important;transform:none!important}'}</style></noscript>
      <a className="wa-float" href={waLink(lang)} target="_blank" rel="noopener noreferrer" aria-label={L.waFloat}>
        <WaIcon />
        <span>{L.waFloat}</span>
      </a>

      <header className="header" id="main-header" lang={lang}>
        <div className="header-inner container-wide">
          <a href={withLang('/', lang)} className="site-logo" aria-label="CrideviSPA">
            <Image src="/assets/cridevispa_logo.png" alt="CrideviSPA" className="header-logo-img" width={160} height={36} priority />
          </a>
          <nav className="header-nav" aria-label={c.nav.menu}>
            {links.map(l => <a key={l.href} className="nav-link" href={withLang(l.href, lang)}>{l.label}</a>)}
          </nav>
          <div className="header-right">
            <div className="lang-switch" aria-label={c.nav.language}>{langLinks}</div>
            <a className="btn-book-header" href={withLang('/treatments', lang)}>{L.book}</a>
            <button className="hamburger" id="hamburger-btn" aria-label={c.nav.menu} aria-expanded="false" aria-controls="mobile-nav">
              <span /><span /><span />
            </button>
          </div>
        </div>
        <nav className="mobile-nav" id="mobile-nav" aria-hidden="true" aria-label={c.nav.menu}>
          {links.map(l => <a key={l.href} className="mobile-nav-link" href={withLang(l.href, lang)}>{l.href === '/artikel' ? L.articlesMobile : l.label}</a>)}
          <div className="mobile-lang-switch"><span>{c.nav.language}:</span>{langLinks}</div>
          <a className="mobile-nav-link" href={withLang('/treatments', lang)}>{L.book}</a>
        </nav>
      </header>

      <main id="main-content" lang={lang}>{children}</main>

      <footer className="site-footer" lang={lang}>
        <div className="footer-inner">
          <div className="footer-brand">
            <Image src="/assets/cridevispa_logo.png" alt="CrideviSPA" className="footer-logo" width={160} height={36} />
            <p className="footer-brand-tagline">Relax · Renew · Rejuvenate</p>
            <p className="footer-brand-desc">{L.footer.desc}</p>
          </div>
          <div>
            <p className="footer-col-title">{L.footer.nav}</p>
            <div className="footer-links">
              <a className="footer-link" href={withLang('/', lang)}>{L.footer.home}</a>
              <a className="footer-link" href={withLang('/treatments', lang)}>{L.footer.treatments}</a>
              <a className="footer-link" href={withLang('/lokasi', lang)}>{L.footer.location}</a>
              <a className="footer-link" href={withLang('/artikel', lang)}>{L.footer.articles}</a>
              <a className="footer-link" href={waLink(lang)} target="_blank" rel="noopener noreferrer">{L.footer.wa}</a>
            </div>
          </div>
          <div>
            <p className="footer-col-title">{L.footer.contact}</p>
            <p className="footer-contact-item"><a href={waLink(lang)} target="_blank" rel="noopener noreferrer">{CONTACT.waDisplay}</a></p>
            <p className="footer-contact-item"><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></p>
            <p className="footer-contact-item">{CONTACT.address}</p>
            <p className="footer-contact-item">{L.footer.hours}</p>
            <p className="footer-contact-item"><a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>@cridevispa</a></p>
          </div>
        </div>
        <div className="footer-divider" />
        <div className="footer-bottom">
          <span className="footer-copy">© {new Date().getFullYear()} CrideviSPA. {L.footer.rights}</span>
          <span className="footer-slogan">Relax · Renew · Rejuvenate</span>
        </div>
      </footer>
      <LegacyEffects />
    </>
  )
}
