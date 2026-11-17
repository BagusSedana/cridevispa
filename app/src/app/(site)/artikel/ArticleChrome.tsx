import type { ReactNode } from 'react'
import type { Lang } from '@/lib/i18n'
import { SiteShell } from '@/components/site/SiteShell'
import './artikel.css'

/** Site chrome around the article layout (styles in artikel.css). */
export function ArticleChrome({ lang, path, children }: { lang: Lang; path: string; children: ReactNode }) {
  return (
    <SiteShell lang={lang} path={path}>
      <div className="art" lang={lang}><div className="art-wrap">{children}</div></div>
    </SiteShell>
  )
}
