export function validateNewPassword(password: string, confirm: string): string | null {
  if (password.length < 12) return 'Password minimal 12 karakter.'
  if (password !== confirm) return 'Konfirmasi password tidak sama.'
  return null
}
