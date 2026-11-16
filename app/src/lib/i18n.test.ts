import { describe, it, expect } from 'vitest'
import { getLang, pick } from './i18n'

describe('getLang', () => {
  it('en', () => expect(getLang({ lang: 'en' })).toBe('en'))
  it('defaults to id', () => expect(getLang({})).toBe('id'))
  it('unknown → id', () => expect(getLang({ lang: 'fr' })).toBe('id'))
  it('array param uses first value', () => expect(getLang({ lang: ['en', 'id'] })).toBe('en'))
})
describe('pick', () => {
  it('uses the language field', () => expect(pick({ title_id: 'Halo', title_en: 'Hello' }, 'title', 'en')).toBe('Hello'))
  it('falls back to the other language when empty', () => expect(pick({ body_id: '', body_en: 'Text' }, 'body', 'id')).toBe('Text'))
})
