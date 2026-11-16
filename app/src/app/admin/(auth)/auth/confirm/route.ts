import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

/** Supabase email links land here: swap the one-time code for a session, then continue. */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const next = request.nextUrl.searchParams.get('next') ?? '/admin'
  const safeNext = next.startsWith('/admin') ? next : '/admin'
  if (code) {
    const db = await createServerClient()
    const { error } = await db.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(new URL(safeNext, request.url))
  }
  return NextResponse.redirect(new URL('/admin/lupa-password?error=expired', request.url))
}
