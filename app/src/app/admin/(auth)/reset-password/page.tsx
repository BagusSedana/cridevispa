import { AuthForm } from '@/components/admin/AuthForm'
import { setNewPassword } from '../actions'

export const metadata = { title: 'Password Baru · Admin CrideviSPA' }

export default function ResetPage() {
  return (
    <>
      <h1>Buat Password Baru</h1>
      <AuthForm action={setNewPassword} submitLabel="Simpan password">
        <label htmlFor="password">Password baru (min. 12 karakter)</label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={12} required />
        <label htmlFor="confirm">Ulangi password</label>
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={12} required />
      </AuthForm>
    </>
  )
}
