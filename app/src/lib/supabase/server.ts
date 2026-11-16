import { createServerClient as createSsrClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/** Supabase client acting as the signed-in user (or anon), for Server Components / actions / routes. */
export async function createServerClient() {
  const cookieStore = await cookies()
  return createSsrClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try { list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch { /* read-only in Server Components */ }
      },
    },
  })
}

export const PUBLIC_FETCH_TIMEOUT_MS = 4000

/** Cookie-less anon client for public content (safe to cache). */
export function createPublicClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
    // A slow or unreachable database must not hang public pages.
    global: { fetch: (input, init) => fetch(input, { ...init, signal: init?.signal ?? AbortSignal.timeout(PUBLIC_FETCH_TIMEOUT_MS) }) },
  })
}
