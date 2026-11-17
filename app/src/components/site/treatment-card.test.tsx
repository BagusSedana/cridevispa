import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { TreatmentList } from './TreatmentList'
import type { CategoryWithTreatments } from '@/lib/types'

const cat = (over: Partial<CategoryWithTreatments> = {}): CategoryWithTreatments => ({
  key: 'massage', name: 'Pijat',
  treatments: [{ id: 't1', name: 'Balinese Massage', description: 'Pijat tradisional', icon: null, badge: null, prices: [
    { id: 'p60', durationMinutes: 60, durationLabel: '60 menit', priceIdr: 250000 },
    { id: 'p90', durationMinutes: 90, durationLabel: '90 menit', priceIdr: 350000 },
  ] }],
  ...over,
})

describe('TreatmentList', () => {
  it('shows each duration with its formatted price and a booking link without ids in the URL', () => {
    const html = renderToStaticMarkup(<TreatmentList lang="id" catalog={[cat()]} />)
    expect(html).toContain('60 menit')
    expect(html).toContain('Rp 250.000')
    expect(html).toContain('Rp 350.000')
    expect(html).toContain('href="/booking"')
    expect(html).not.toContain('items=')
    expect(html).toContain('&quot;id&quot;:&quot;p90&quot;') // id travels in the popup data, not the URL
  })
  it('keeps ?lang=en on the booking link', () => {
    expect(renderToStaticMarkup(<TreatmentList lang="en" catalog={[cat()]} />)).toContain('href="/booking?lang=en"')
  })
  it('booking links carry the popup data (photo, description, price) and keep the /booking fallback', () => {
    const html = renderToStaticMarkup(<TreatmentList lang="id" catalog={[cat()]} />)
    expect(html).toContain('data-treatment="')
    expect(html).toContain('/assets/offer_massage.jpg')
    expect(html).toContain('Pijat tradisional')
    expect(html).toContain('aria-haspopup="dialog"')
  })
  it('skips a treatment without prices and a category left empty (Review Focus 4)', () => {
    const empty = cat({ key: 'ear', name: 'Ear Candle', treatments: [{ id: 't2', name: 'Ear Candle', description: '', icon: null, badge: null, prices: [] }] })
    const html = renderToStaticMarkup(<TreatmentList lang="id" catalog={[cat(), empty]} />)
    expect(html).not.toContain('Ear Candle')
  })
})
