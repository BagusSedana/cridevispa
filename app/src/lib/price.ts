/** "Rp 250.000" → 250000. Throws if the text holds no digits. */
export function parseRupiah(text: string): number {
  const digits = text.replace(/[^0-9]/g, '')
  if (!digits) throw new Error(`Not a rupiah amount: "${text}"`)
  return Number.parseInt(digits, 10)
}

/** 250000 → "Rp 250.000" */
export function formatRupiah(amount: number): string {
  return 'Rp ' + Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
