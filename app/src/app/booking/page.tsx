import { getCatalog } from '@/lib/catalog'
import { getLang } from '@/lib/i18n'
import { ArticleChrome } from '../artikel/ArticleChrome'
import { BookingForm } from './BookingForm'
import './booking.css'

export const metadata = { title: 'Booking', robots: { index: false, follow: true } }

export default async function BookingPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const lang = getLang(await searchParams)
  const catalog = await getCatalog(lang)
  return (
    <ArticleChrome lang={lang} path="/booking">
      <h1>{lang === 'en' ? 'Book a home service' : 'Booking home service'}</h1>
      <div className="bk"><BookingForm catalog={catalog} lang={lang} /></div>
    </ArticleChrome>
  )
}
