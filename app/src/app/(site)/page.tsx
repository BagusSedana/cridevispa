import type { Metadata } from 'next'
import { getLang } from '@/lib/i18n'
import { getCatalogSafe } from '@/lib/catalog'
import { getPriceRange } from '@/lib/price-range'
import { getPublishedReviews } from '@/lib/reviews'
import { formatRupiah } from '@/lib/price'
import { businessJsonLd, jsonLdString } from '@/lib/business-jsonld'
import { pageMetadata } from '@/lib/metadata'
import { SiteShell } from '@/components/site/SiteShell'
import { Hero } from '@/components/home/Hero'
import { Reviews } from '@/components/home/Reviews'
import { Banner, ClosingCta, Faq, FeaturedTreatments, Intro, PriceList, Process, Split, Trust } from '@/components/home/Sections'

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const lang = getLang(await searchParams)
  return pageMetadata({
    path: '/', lang,
    title: lang === 'en' ? 'CrideviSPA | Home Service Massage & Spa in Bali' : 'CrideviSPA | Home Service Massage & Spa di Bali',
    description: lang === 'en'
      ? 'Certified therapists come to your villa, hotel or home in Denpasar & surroundings. Transparent prices, open daily 07:00–23:00. Book on WhatsApp.'
      : 'Terapis bersertifikat datang ke villa, hotel, atau rumah Anda di Denpasar & sekitarnya. Harga transparan, buka setiap hari 07:00–23:00. Booking via WhatsApp.',
  })
}

export default async function Home({ searchParams }: Props) {
  const lang = getLang(await searchParams)
  const [catalog, range, reviews] = await Promise.all([
    getCatalogSafe(lang),
    getPriceRange(),
    getPublishedReviews(lang),
  ])
  const min = range ? formatRupiah(range.min) : null

  return (
    <SiteShell lang={lang} path="/">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(businessJsonLd(range, lang)) }} />
      <Hero lang={lang} />
      <Intro lang={lang} />
      <Split lang={lang} />
      <Trust lang={lang} min={min} />
      <FeaturedTreatments lang={lang} catalog={catalog} />
      <Banner lang={lang} />
      <PriceList lang={lang} catalog={catalog} />
      <Reviews lang={lang} items={reviews} />
      <Process lang={lang} />
      <Faq lang={lang} />
      <ClosingCta lang={lang} />
    </SiteShell>
  )
}
