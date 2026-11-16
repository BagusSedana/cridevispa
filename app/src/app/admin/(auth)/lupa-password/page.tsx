import Link from 'next/link'
import { AuthForm } from '@/components/admin/AuthForm'
import { requestPasswordReset } from '../actions'

export const metadata = { title: 'Lupa Password · Admin CrideviSPA' }

export default async function ForgotPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  return (
    <>
      <h1>Lupa Password</h1>
      {error === 'expired' && <p className="msg msg-err">Link reset sudah tidak berlaku. Minta link baru di bawah.</p>}
      <p className="muted">Masukkan email admin. Kami kirim link untuk membuat password baru.</p>
      <AuthForm action={requestPasswordReset} submitLabel="Kirim link reset">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
      </AuthForm>
      <p className="msg"><Link href="/admin/login">← Kembali ke login</Link></p>
    </>
  )
}
