import { describe, it, expect } from 'vitest'
import { withLang, waLink } from './links'
import { getLang } from './i18n'

describe('withLang', () => {
  it('adds ?lang=en', () => expect(withLang('/treatments', 'en')).toBe('/treatments?lang=en'))
  it('leaves Indonesian URLs clean', () => expect(withLang('/treatments', 'id')).toBe('/treatments'))
  it('keeps an existing query', () => expect(withLang('/booking?items=a', 'en')).toBe('/booking?items=a&lang=en'))
  it('keeps a hash after the query', () => expect(withLang('/#faq', 'en')).toBe('/?lang=en#faq'))
  it('replaces a stale lang param', () => expect(withLang('/x?lang=en', 'id')).toBe('/x'))
})

describe('getLang edge cases (Review Focus 3)', () => {
  it('first value wins when lang is repeated', () => expect(getLang({ lang: ['en', 'id'] })).toBe('en'))
  it('unknown value falls back to Indonesian', () => expect(getLang({ lang: 'xx' })).toBe('id'))
})

describe('waLink', () => {
  it('opens the CrideviSPA WhatsApp with a language-specific greeting', () => {
    expect(waLink('id')).toBe('https://wa.me/6285812429650?text=' + encodeURIComponent('Halo CrideviSPA, saya ingin reservasi home service massage.'))
    expect(waLink('en')).toContain(encodeURIComponent("Hello CrideviSPA, I'd like to book"))
  })
})
