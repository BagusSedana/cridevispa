import type { Metadata } from 'next'
import { getLang } from '@/lib/i18n'
import { t } from '@/content/copy'
import { pageMetadata } from '@/lib/metadata'
import { CONTACT, waLink, withLang } from '@/lib/links'
import { SiteShell } from '@/components/site/SiteShell'
import site from '@/components/site/site.module.css'
import s from './lokasi.module.css'

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const lang = getLang(await searchParams)
  const c = t(lang).location
  return pageMetadata({ path: '/lokasi', lang, title: c.title, description: c.desc, image: '/assets/wellness_split.jpg' })
}

export default async function LocationPage({ searchParams }: Props) {
  const lang = getLang(await searchParams)
  const c = t(lang)
  return (
    <SiteShell lang={lang} path="/lokasi">
      <div className={s.page}>
        <h1>{c.location.title}</h1>
        <p className={s.intro}>{c.area.desc}</p>
        <div className={s.grid}>
          <section className={s.card} aria-labelledby="hours">
            <h2 id="hours">{c.area.hoursLabel}</h2>
            <p><strong>{c.area.hours}</strong><br />{c.area.lastBooking}</p>
            <h2>{c.area.label}</h2>
            <p>{c.area.title}</p>
          </section>
          <section className={s.card} aria-labelledby="contact">
            <h2 id="contact">{c.location.contact}</h2>
            <p><a href={waLink(lang)} target="_blank" rel="noopener noreferrer">WhatsApp {CONTACT.waDisplay}</a><br />
              <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a><br />
              <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer">Instagram @cridevispa</a></p>
            <h2>{c.location.address}</h2>
            <p>{CONTACT.address}</p>
            <a className={`${site.btn} ${site.btnGold}`} href={waLink(lang)} target="_blank" rel="noopener noreferrer">{c.hero.book}</a>
          </section>
        </div>
        <iframe className={s.map} title={c.location.map} src={CONTACT.mapsEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        <p><a href={CONTACT.mapsUrl} target="_blank" rel="noopener noreferrer">{c.location.map} ↗</a></p>
        <section className={s.about} aria-labelledby="about">
          <h2 id="about">{c.location.about}</h2>
          <p>{c.location.aboutBody}</p>
          <a className={`${site.btn} ${site.btnDark}`} href={withLang('/treatments', lang)}>{c.treatments.seeAll}</a>
        </section>
      </div>
    </SiteShell>
  )
}
