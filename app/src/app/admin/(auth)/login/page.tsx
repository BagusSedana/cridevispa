import Link from 'next/link'
import { AuthForm } from '@/components/admin/AuthForm'
import { signIn } from '../actions'

export const metadata = { title: 'Masuk · Admin CrideviSPA' }

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  return (
    <>
      <h1>Admin CrideviSPA</h1>
      {error === 'forbidden' && <p className="msg msg-err">Akun ini tidak punya akses admin.</p>}
      <AuthForm action={signIn} submitLabel="Masuk">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
      </AuthForm>
      <p className="msg"><Link href="/admin/lupa-password">Lupa password?</Link></p>
    </>
  )
}
