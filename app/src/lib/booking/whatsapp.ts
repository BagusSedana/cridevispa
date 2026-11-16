import { formatRupiah } from '@/lib/price'
import type { Lang } from '@/lib/i18n'

export const WA_NUMBER = '6285812429650'

export type WaBooking = {
  name: string; phone: string; date: string; time: string; message: string
  items: { name: string; durationLabel: string; priceIdr: number }[]
  totalIdr: number
}

/** Same text the legacy site sent (js/main.js), so the owner's WhatsApp flow is unchanged. */
export function buildWaMessage(lang: Lang, b: WaBooking): string {
  const lines = b.items.map((t, i) => `${i + 1}. ${t.name} (${t.durationLabel}) — ${formatRupiah(t.priceIdr)}`).join('\n')
  const total = formatRupiah(b.totalIdr)
  return lang === 'id'
    ? `Halo CrideviSPA, saya ingin melakukan reservasi:\n\n*Daftar Treatment*:\n${lines}\n\n*Total Perkiraan*: ${total}\n*Tanggal*: ${b.date}\n*Waktu*: ${b.time} WITA\n*Lokasi*: Denpasar (Home Service)\n\n*Nama*: ${b.name}\n*No. HP*: ${b.phone}\n${b.message ? `*Alamat / Pesan Tambahan*: ${b.message}` : ''}\n\nMohon konfirmasinya. Terima kasih!`
    : `Hello CrideviSPA, I'd like to book an appointment:\n\n*Treatments*:\n${lines}\n\n*Estimated Total*: ${total}\n*Date*: ${b.date}\n*Time*: ${b.time}\n*Location*: Denpasar (Home Service)\n\n*Name*: ${b.name}\n*Phone*: ${b.phone}\n${b.message ? `*Address / Notes*: ${b.message}` : ''}\n\nPlease confirm. Thank you!`
}

export function buildWaUrl(text: string): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`
}
