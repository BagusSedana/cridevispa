import type { ReactNode } from 'react'
import type { Lang } from '@/lib/i18n'
import './artikel.css'

export function ArticleChrome({ lang, path, children }: { lang: Lang; path: string; children: ReactNode }) {
  return (
    <div className="art" lang={lang}>
      <header className="art-top">
        <a href={lang === 'en' ? '/?lang=en' : '/'}><strong>CrideviSPA</strong></a>
        <nav className="lang" aria-label={lang === 'en' ? 'Language' : 'Bahasa'}>
          <a href={path} aria-current={lang === 'id' ? 'true' : undefined}>ID</a>
          <a href={`${path}?lang=en`} aria-current={lang === 'en' ? 'true' : undefined}>EN</a>
        </nav>
      </header>
      <main className="art-wrap">{children}</main>
    </div>
  )
}
