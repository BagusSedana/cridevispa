// Google Search Console ownership file. Served at /google0a6bca9b0fd31cf8.html via a rewrite in next.config.ts
// (Vercel does not route paths ending in .html to a same-named app route).
export const dynamic = 'force-static'

export function GET() {
  return new Response('google-site-verification: google0a6bca9b0fd31cf8.html', {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  })
}
