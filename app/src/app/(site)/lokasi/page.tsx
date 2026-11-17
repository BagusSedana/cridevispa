import type { Metadata } from 'next'
import Image from 'next/image'
import { getLang } from '@/lib/i18n'
import { t } from '@/content/copy'
import { getCatalogSafe } from '@/lib/catalog'
import { pageMetadata } from '@/lib/metadata'
import { CONTACT, waLink, withLang } from '@/lib/links'
import { SiteShell } from '@/components/site/SiteShell'
import { TreatmentList } from '@/components/site/TreatmentList'

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const lang = getLang(await searchParams)
  const c = t(lang).location
  return pageMetadata({ path: '/lokasi', lang, title: c.title, description: c.desc, image: '/assets/wellness_split.jpg' })
}

/** Location page in the legacy layout. */
export default async function LocationPage({ searchParams }: Props) {
  const lang = getLang(await searchParams)
  const c = t(lang)
  const L = c.legacy.locationPage
  const catalog = (await getCatalogSafe(lang)) ?? []
  return (
    <SiteShell lang={lang} path="/lokasi">
      <div className="loc-detail-wrap">
        <div className="breadcrumb-bar container-wide">
          <a href={withLang('/', lang)} className="breadcrumb-link">{L.back}</a>
        </div>

        <div className="loc-title-block container-wide">
          <Image src="/assets/cridevispa_logo.png" alt="" className="loc-logo" width={160} height={36} />
          <h1 className="loc-name">CrideviSPA</h1>
          <p className="loc-address">{CONTACT.address}</p>
          <div className="loc-contact">
            <a href={withLang('/treatments', lang)} className="loc-phone">{L.pick}</a>
            <a href={CONTACT.mapsUrl} className="loc-directions" target="_blank" rel="noopener noreferrer">{c.location.map}</a>
          </div>
        </div>

        <div className="loc-gallery">
          <div className="gallery-main">
            <Image src="/assets/hero_bali.jpg" alt="CrideviSPA home service" width={760} height={400} sizes="(min-width: 900px) 66vw, 100vw" />
          </div>
          <div className="gallery-side">
            <Image src="/assets/massage_service.jpg" alt="" width={370} height={199} sizes="(min-width: 900px) 33vw, 50vw" />
            <Image src="/assets/facial_service.jpg" alt="" width={370} height={199} sizes="(min-width: 900px) 33vw, 50vw" />
          </div>
        </div>

        <div className="loc-treatments-section container-wide">
          <div className="loc-treatments-main">
            <h2 className="treatments-heading">{L.heading}</h2>
            {catalog.length > 0
              ? <TreatmentList lang={lang} catalog={catalog} />
              : <p>{c.treatments.empty} <a href={waLink(lang)} target="_blank" rel="noopener noreferrer">WhatsApp</a></p>}
          </div>

          <aside className="loc-sidebar" aria-label={L.contactLabel}>
            <Image src="/assets/cridevispa_logo.png" alt="" className="sidebar-logo" width={160} height={36} />
            <h2 className="sidebar-loc-name">CrideviSPA<br /><small>Home Service Massage</small></h2>
            <div className="sidebar-rule" />
            <a className="btn-book-loc" href={withLang('/treatments', lang)}>{L.pick}</a>
            <div className="sidebar-info">
              <div className="sidebar-info-item">
                <p className="sidebar-info-label">{L.hoursLabel}</p>
                <p className="sidebar-info-val">{L.hoursVal}</p>
              </div>
              <div className="sidebar-info-item">
                <p className="sidebar-info-label">{L.areaLabel}</p>
                <p className="sidebar-info-val">{L.areaVal}</p>
              </div>
              <div className="sidebar-info-item">
                <p className="sidebar-info-label">{L.contactLabel}</p>
                <p className="sidebar-info-val"><a href={waLink(lang)} target="_blank" rel="noopener noreferrer">{CONTACT.waDisplay}</a></p>
                <p className="sidebar-info-val"><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></p>
              </div>
            </div>
            <div className="sidebar-note"><p>{L.note}</p></div>
          </aside>
        </div>

        <div className="loc-about-section container-wide">
          <h2 className="loc-about-heading">{c.location.about}</h2>
          <p className="loc-about-body">{c.location.aboutBody}</p>
        </div>

        <div className="loc-hours-section container-wide">
          <h2 className="loc-hours-heading">{L.hoursHeading}</h2>
          <table className="hours-table">
            <caption className="sr-only">{L.hoursHeading}</caption>
            <tbody>
              <tr><th scope="row">{L.daily}</th><td><strong>07:00 – 23:00</strong></td></tr>
              <tr><th scope="row">{L.last}</th><td>22:00</td></tr>
            </tbody>
          </table>
        </div>

        <div className="loc-map-section container-wide">
          <h2 className="loc-hours-heading">{L.mapHeading}</h2>
          <iframe src={CONTACT.mapsEmbed} width="100%" height="320" style={{ border: '1px solid var(--border)', display: 'block' }} loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={c.location.map} />
          <p className="map-fallback"><a href={CONTACT.mapsUrl} target="_blank" rel="noopener noreferrer">{c.location.map}</a></p>
        </div>
      </div>
    </SiteShell>
  )
}
