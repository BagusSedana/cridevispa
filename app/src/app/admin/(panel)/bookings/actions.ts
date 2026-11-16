'use server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import { BOOKING_STATUSES, type BookingStatus } from '@/lib/types'

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<void> {
  await requireAdmin()
  if (!BOOKING_STATUSES.includes(status)) throw new Error('Status tidak valid')
  const db = await createServerClient()
  const { error } = await db.from('bookings').update({ status }).eq('id', id)
  if (error) throw new Error('Gagal menyimpan status')
  revalidatePath('/admin')
  revalidatePath(`/admin/bookings/${id}`)
}

export async function updateBookingNote(id: string, note: string): Promise<void> {
  await requireAdmin()
  const db = await createServerClient()
  const { error } = await db.from('bookings').update({ admin_note: note.trim().slice(0, 2000) }).eq('id', id)
  if (error) throw new Error('Gagal menyimpan catatan')
  revalidatePath(`/admin/bookings/${id}`)
}
