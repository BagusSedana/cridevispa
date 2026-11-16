import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { Markdown } from './Markdown'

const html = (md: string) => renderToStaticMarkup(<Markdown source={md} />)

describe('Markdown', () => {
  it('renders headings and bold', () => {
    expect(html('## Judul')).toContain('<h2>Judul</h2>')
    expect(html('**tebal**')).toContain('<strong>tebal</strong>')
  })
  it('strips raw <script>', () => expect(html('hi <script>alert(1)</script>')).not.toContain('<script'))
  it('strips onerror on raw img', () => expect(html('<img src="x" onerror="alert(1)">')).not.toContain('onerror'))
  it('drops javascript: links', () => expect(html('[x](javascript:alert(1))')).not.toContain('javascript:'))
  it('keeps markdown images', () => expect(html('![alt](https://example.com/a.jpg)')).toContain('src="https://example.com/a.jpg"'))
})
