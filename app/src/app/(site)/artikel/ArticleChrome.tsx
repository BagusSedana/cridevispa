import type { ReactNode } from 'react'
import type { Lang } from '@/lib/i18n'
import { SiteShell } from '@/components/site/SiteShell'
import './artikel.css'

/** Temporary bridge until Task 8 restyles articles: site chrome around the phase-2 article layout. */
export function ArticleChrome({ lang, path, children }: { lang: Lang; path: string; children: ReactNode }) {
  return (
    <SiteShell lang={lang} path={path}>
      <div className="art" lang={lang}><div className="art-wrap">{children}</div></div>
    </SiteShell>
  )
}
