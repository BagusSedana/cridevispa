import type { Lang } from './i18n'
import { buildWaUrl } from './booking/whatsapp'

/** Adds/removes ?lang=en on an internal path, keeping other query params and the hash. */
export function withLang(path: string, lang: Lang): string {
  const [beforeHash, hash = ''] = path.split('#')
  const [pathname, query = ''] = beforeHash.split('?')
  const params = new URLSearchParams(query)
  params.delete('lang')
  if (lang === 'en') params.set('lang', 'en')
  const qs = params.toString()
  return `${pathname || '/'}${qs ? `?${qs}` : ''}${hash ? `#${hash}` : ''}`
}

const GREETING: Record<Lang, string> = {
  id: 'Halo CrideviSPA, saya ingin reservasi home service massage.',
  en: "Hello CrideviSPA, I'd like to book a home service massage.",
}

export function waLink(lang: Lang, text: string = GREETING[lang]): string {
  return buildWaUrl(text)
}

export const CONTACT = {
  waDisplay: '+62 858-1242-9650',
  email: 'info@cridevispa.com',
  instagram: 'https://instagram.com/cridevispa',
  address: 'Jl. Gunung Payung II No 26, Padangsambian Kelod, Denpasar Barat, Bali',
  mapsUrl: 'https://maps.google.com/?q=Jl+Gunung+Payung+II+No+26+Padangsambian+Kelod+Denpasar+Barat+Bali',
  mapsEmbed: 'https://www.google.com/maps?q=Jl+Gunung+Payung+II+No+26+Padangsambian+Kelod+Denpasar+Barat+Bali&output=embed',
} as const
