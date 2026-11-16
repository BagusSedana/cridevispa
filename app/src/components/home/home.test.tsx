import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { Hero } from './Hero'
import { Reviews } from './Reviews'

describe('Hero', () => {
  it('shows the DB starting price, WhatsApp and price links', () => {
    const html = renderToStaticMarkup(<Hero lang="id" min={100000} />)
    expect(html).toContain('Rp 100.000')
    expect(html).toContain('https://wa.me/6285812429650')
    expect(html).toContain('href="/treatments"')
    expect(html).toContain('Spa villa terbaik')
  })
  it('English links keep ?lang=en', () => {
    expect(renderToStaticMarkup(<Hero lang="en" min={100000} />)).toContain('href="/treatments?lang=en"')
  })
  it('hides the price line when the price is unknown (never "Rp 0")', () => {
    const html = renderToStaticMarkup(<Hero lang="id" min={null} />)
    expect(html).not.toContain('Rp 0')
    expect(html).not.toContain('{min}')
    expect(html).not.toContain('Mulai')
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
