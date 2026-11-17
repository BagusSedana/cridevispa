import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { Hero } from './Hero'
import { Reviews } from './Reviews'
import { FeaturedTreatments, PriceList } from './Sections'

describe('Hero', () => {
  it('shows the legacy headline and links to the treatment menu', () => {
    const html = renderToStaticMarkup(<Hero lang="id" />)
    expect(html).toContain('Traditional Care,')
    expect(html).toContain('href="/treatments"')
  })
  it('English links keep ?lang=en', () => {
    expect(renderToStaticMarkup(<Hero lang="en" />)).toContain('href="/treatments?lang=en"')
  })
})

describe('home sections', () => {
  const catalog = [
    { key: 'massage', name: 'Pijat', treatments: [{ id: 't1', name: 'Balinese Massage', description: '', icon: null, badge: null, prices: [{ id: 'p1', durationMinutes: 60, durationLabel: '60 menit', priceIdr: 250000 }, { id: 'p2', durationMinutes: 90, durationLabel: '90 menit', priceIdr: 350000 }] }] },
    { key: 'ear', name: 'Ear Candle', treatments: [{ id: 't2', name: 'Ear Candle', description: '', icon: null, badge: null, prices: [{ id: 'p3', durationMinutes: 60, durationLabel: '60 menit', priceIdr: 100000 }] }] },
  ]
  it('featured cards take their starting prices from the DB catalog', () => {
    const html = renderToStaticMarkup(<FeaturedTreatments lang="id" catalog={catalog} />)
    expect(html).toContain('Mulai Rp 250.000')
    expect(html).toContain('Mulai Rp 100.000')
    expect(html).not.toContain('Package Treatment') // no packages in this catalog
  })
  it('price list shows each treatment once at its lowest price', () => {
    const html = renderToStaticMarkup(<PriceList lang="id" catalog={catalog} />)
    expect(html.match(/Balinese Massage/g)).toHaveLength(1)
    expect(html).toContain('Rp 250.000')
    expect(html).not.toContain('Rp 350.000')
  })
  it('sections disappear without a catalog (DB down)', () => {
    expect(renderToStaticMarkup(<FeaturedTreatments lang="id" catalog={null} />)).toBe('')
    expect(renderToStaticMarkup(<PriceList lang="id" catalog={null} />)).toBe('')
  })
})

describe('Reviews', () => {
  it('renders nothing when there are no real reviews', () => {
    expect(renderToStaticMarkup(<Reviews lang="id" items={[]} />)).toBe('')
  })
  it('renders a published review with its stars', () => {
    const html = renderToStaticMarkup(<Reviews lang="id" items={[{ id: '1', name: 'Made', origin: 'Sanur', treatment: 'Balinese Massage', rating: 4, text: 'Mantap' }]} />)
    expect(html).toContain('Made')
    expect(html).toContain('aria-label="4/5"')
  })
})
