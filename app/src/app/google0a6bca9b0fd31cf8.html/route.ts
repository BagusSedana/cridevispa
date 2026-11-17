// Google Search Console ownership file (kept from the static site; .html files in public/ are not served here).
// Dynamic on purpose: Vercel serves a prerendered '.html' route only without the extension.
export const dynamic = 'force-dynamic'

export function GET() {
  return new Response('google-site-verification: google0a6bca9b0fd31cf8.html', {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  })
}
