import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.next()
  const host = request.headers.get('host') ?? ''
  if (host.endsWith('.vercel.app')) {
    response.headers.set('X-Robots-Tag', 'noindex')
  }
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
