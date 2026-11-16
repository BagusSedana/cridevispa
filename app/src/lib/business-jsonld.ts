import type { Lang } from './i18n'
import { SITE_URL } from './seo'

/** LocalBusiness data for Google. Deliberately no aggregateRating/review: self-hosted reviews are not eligible and risk a penalty. */
export function businessJsonLd(range: { min: number; max: number } | null, lang: Lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HealthAndBeautyBusiness',
    name: 'CrideviSPA',
    url: `${SITE_URL}/`,
    image: `${SITE_URL}/assets/hero_bali.jpg`,
    logo: `${SITE_URL}/assets/cridevispa_logo.png`,
    description: lang === 'en'
      ? 'Home service massage and spa in Denpasar, Bali — therapists come to your home, hotel or villa.'
      : 'Home service massage dan spa di Denpasar, Bali — terapis datang ke rumah, hotel, atau villa Anda.',
    telephone: '+6285812429650',
    email: 'info@cridevispa.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Jl. Gunung Payung II No 26, Padangsambian Kelod',
      addressLocality: 'Denpasar Barat',
      addressRegion: 'Bali',
      addressCountry: 'ID',
    },
    areaServed: ['Denpasar', 'Seminyak', 'Canggu', 'Kuta', 'Sanur', 'Nusa Dua', 'Kerobokan', 'Ubud'],
    openingHours: 'Mo-Su 07:00-23:00',
    sameAs: ['https://instagram.com/cridevispa'],
    ...(range ? { priceRange: `IDR ${range.min} - IDR ${range.max}` } : {}),
  }
}

/** JSON for a <script type="application/ld+json">, safe against "</script>" injection. */
export const jsonLdString = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c')
