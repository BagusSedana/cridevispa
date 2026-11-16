import type { BookingStatus } from '@/lib/types'

export const STATUS_LABEL: Record<BookingStatus, string> = {
  new: 'Baru',
  confirmed: 'Dikonfirmasi',
  done: 'Selesai',
  cancelled: 'Batal',
}

export function formatDateId(date: string): string {
  return new Date(`${date}T00:00:00+08:00`).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Makassar' })
}

export function formatDateTimeId(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Makassar' })
}
