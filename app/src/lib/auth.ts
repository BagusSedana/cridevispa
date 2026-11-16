import 'server-only'
import { redirect } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createServerClient } from './supabase/server'

export type AdminState = { kind: 'anon' } | { kind: 'not-admin' } | { kind: 'admin'; userId: string }

export async function resolveAdminState(db: Pick<SupabaseClient, 'auth' | 'rpc'>): Promise<AdminState> {
  const { data } = await db.auth.getUser()
  if (!data.user) return { kind: 'anon' }
  const { data: isAdmin } = await db.rpc('is_admin')
  return isAdmin === true ? { kind: 'admin', userId: data.user.id } : { kind: 'not-admin' }
}

/** Call at the top of every admin page and server action. */
export async function requireAdmin(): Promise<{ userId: string }> {
  const state = await resolveAdminState(await createServerClient())
  if (state.kind === 'anon') redirect('/admin/login')
  if (state.kind === 'not-admin') redirect('/admin/login?error=forbidden')
  return { userId: state.userId }
}
