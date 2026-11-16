import Image from 'next/image'
import type { ReactNode } from 'react'
import type { Lang } from '@/lib/i18n'
import { t } from '@/content/copy'
import { CONTACT, waLink, withLang } from '@/lib/links'
import s from './site.module.css'

/** Header + footer + floating WhatsApp button around every public page. `path` = this page's path without ?lang. */
export function SiteShell({ lang, path, children }: { lang: Lang; path: string; children: ReactNode }) {
  const c = t(lang)
  const links = [
    { href: '/', label: c.nav.home },
    { href: '/treatments', label: c.nav.treatments },
    { href: '/lokasi', label: c.nav.location },
    { href: '/artikel', label: c.nav.articles },
  ]
  return (
    <>
      <header className={s.header}>
        <div className={s.headerInner}>
          <a className={s.logo} href={withLang('/', lang)} aria-label="CrideviSPA">
            <Image src="/assets/cridevispa_logo.png" alt="" width={40} height={40} priority />
            <span>CrideviSPA</span>
          </a>
          <nav className={s.nav} aria-label={c.nav.menu}>
            {links.map(l => <a key={l.href} href={withLang(l.href, lang)}>{l.label}</a>)}
          </nav>
          <div className={s.lang} aria-label={c.nav.language}>
            <a href={withLang(path, 'id')} hrefLang="id" aria-current={lang === 'id' ? 'true' : undefined}>ID</a>
            <a href={withLang(path, 'en')} hrefLang="en" aria-current={lang === 'en' ? 'true' : undefined}>EN</a>
          </div>
          <a className={`${s.btn} ${s.btnGold} ${s.bookBtn}`} href={withLang('/treatments', lang)}>{c.nav.book}</a>
          <details className={s.menu}>
            <summary aria-label={c.nav.menu}><span /></summary>
            <div className={s.menuPanel}>
              {links.map(l => <a key={l.href} href={withLang(l.href, lang)}>{l.label}</a>)}
              <a href={withLang('/treatments', lang)}>{c.nav.book}</a>
            </div>
          </details>
        </div>
      </header>

      <main>{children}</main>

      <footer className={s.footer}>
        <div className={s.footerInner}>
          <div>
            <div className={s.footerBrand}>CrideviSPA</div>
            <p>{c.footer.tagline}</p>
          </div>
          <div>
            <h2>{c.footer.explore}</h2>
            {links.map(l => <div key={l.href}><a href={withLang(l.href, lang)}>{l.label}</a></div>)}
          </div>
          <div>
            <h2>{c.footer.contact}</h2>
            <div><a href={waLink(lang)} target="_blank" rel="noopener noreferrer">WhatsApp {CONTACT.waDisplay}</a></div>
            <div><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></div>
            <div><a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer">Instagram @cridevispa</a></div>
            <p>{CONTACT.address}</p>
          </div>
        </div>
        <div className={s.footerBottom}>© {new Date().getFullYear()} CrideviSPA. {c.footer.rights}</div>
      </footer>

      <a className={s.fab} href={waLink(lang)} target="_blank" rel="noopener noreferrer" aria-label={c.hero.book}>
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z" /></svg>
        <span>WhatsApp</span>
      </a>
    </>
  )
}
