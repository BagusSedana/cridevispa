import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const APP_PRODUCTION_HOST = 'cridevispa-app.vercel.app'
const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/lupa-password', '/admin/reset-password', '/admin/auth']

function hasSessionCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some(c => c.name.startsWith('sb-') && c.name.includes('-auth-token'))
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  // After the domain cutover, send the production vercel.app host to www (previews stay reachable).
  if (process.env.REDIRECT_APP_HOST_TO_WWW === '1' && request.headers.get('host') === APP_PRODUCTION_HOST) {
    const target = new URL(request.nextUrl.pathname + request.nextUrl.search, 'https://www.cridevispa.com')
    return NextResponse.redirect(target, 308)
  }
  let response = NextResponse.next({ request })
  const { pathname } = request.nextUrl
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/')
  const isPublicAdmin = PUBLIC_ADMIN_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))

  if (isAdmin && !isPublicAdmin) {
    // Optimistic check only; every admin page and action still calls requireAdmin() on the server.
    if (!hasSessionCookie(request)) {
      response = NextResponse.redirect(new URL('/admin/login', request.url))
    } else {
      const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (list) => {
            list.forEach(({ name, value }) => request.cookies.set(name, value))
            response = NextResponse.next({ request })
            list.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
          },
        },
      })
      const { data } = await supabase.auth.getUser()
      if (!data.user) response = NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Public pages stay indexable: www proxies to this app's *.vercel.app host, and canonical tags point to www.
  if (isAdmin) response.headers.set('X-Robots-Tag', 'noindex')
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
