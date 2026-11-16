'use server'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { validateNewPassword } from '@/lib/password'

export type FormState = { message: string; ok?: boolean } | null

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.cridevispa.com'
const RESET_SENT = 'Jika email terdaftar, link reset sudah dikirim. Cek inbox atau folder spam.'

export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  const db = await createServerClient()
  const { error } = await db.auth.signInWithPassword({
    email: String(form.get('email') ?? '').trim(),
    password: String(form.get('password') ?? ''),
  })
  if (error) return { message: 'Email atau password salah.' }
  redirect('/admin')
}

export async function signOut(): Promise<void> {
  const db = await createServerClient()
  await db.auth.signOut()
  redirect('/admin/login')
}

export async function requestPasswordReset(_: FormState, form: FormData): Promise<{ message: string; ok: true }> {
  const email = String(form.get('email') ?? '').trim()
  if (email) {
    const db = await createServerClient()
    await db.auth.resetPasswordForEmail(email, { redirectTo: `${SITE_URL}/admin/auth/confirm?next=/admin/reset-password` })
  }
  return { message: RESET_SENT, ok: true }
}

export async function setNewPassword(_: FormState, form: FormData): Promise<FormState> {
  const password = String(form.get('password') ?? '')
  const problem = validateNewPassword(password, String(form.get('confirm') ?? ''))
  if (problem) return { message: problem }
  const db = await createServerClient()
  const { error } = await db.auth.updateUser({ password })
  if (error) return { message: 'Link reset sudah tidak berlaku. Minta link baru dari halaman Lupa Password.' }
  redirect('/admin')
}
