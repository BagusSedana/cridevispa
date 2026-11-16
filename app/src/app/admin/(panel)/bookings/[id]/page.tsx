import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { formatRupiah } from '@/lib/price'
import { BOOKING_STATUSES, type BookingStatus } from '@/lib/types'
import { STATUS_LABEL, formatDateId, formatDateTimeId } from '@/lib/booking/labels'
import { updateBookingNote, updateBookingStatus } from '../actions'

export const metadata = { title: 'Detail Booking · Admin CrideviSPA' }

type Item = { name: string; durationLabel: string; priceIdr: number }

export default async function BookingDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = await createServerClient()
  const { data: b } = await db.from('bookings').select('*').eq('id', id).maybeSingle()
  if (!b) notFound()

  async function setStatus(form: FormData) {
    'use server'
    await updateBookingStatus(id, String(form.get('status')) as BookingStatus)
  }
  async function saveNote(form: FormData) {
    'use server'
    await updateBookingNote(id, String(form.get('note') ?? ''))
  }

  const waText = encodeURIComponent(`Halo ${b.name}, terima kasih sudah booking di CrideviSPA untuk ${formatDateId(b.booking_date)} pukul ${String(b.booking_time).slice(0, 5)} WITA.`)

  return (
    <>
      <p><Link href="/admin">← Semua booking</Link></p>
      <h1>{b.name}</h1>
      <p className="muted">Masuk {formatDateTimeId(b.created_at)} · Bahasa {b.lang === 'en' ? 'Inggris' : 'Indonesia'}</p>

      <div className="grid2">
        <section className="panel">
          <h2>Jadwal</h2>
          <p><strong>{formatDateId(b.booking_date)}</strong>, {String(b.booking_time).slice(0, 5)} WITA</p>
          <p>HP: +{b.phone}{b.email ? <><br />Email: {b.email}</> : null}</p>
          {b.address_note && <p>Alamat / pesan:<br />{b.address_note}</p>}
          <a className="btn" href={`https://wa.me/${b.phone}?text=${waText}`} target="_blank" rel="noopener noreferrer">Buka WhatsApp</a>
        </section>

        <section className="panel">
          <h2>Treatment</h2>
          <ul>
            {(b.items as Item[]).map((t, i) => <li key={i}>{t.name} ({t.durationLabel}) — {formatRupiah(t.priceIdr)}</li>)}
          </ul>
          <p><strong>Total: {formatRupiah(b.total_idr)}</strong></p>
        </section>
      </div>

      <section className="panel">
        <form action={setStatus} className="row">
          <div>
            <label htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={b.status}>
              {BOOKING_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
          </div>
          <button type="submit">Simpan status</button>
        </form>
        <form action={saveNote}>
          <label htmlFor="note">Catatan admin (tidak terlihat pelanggan)</label>
          <textarea id="note" name="note" defaultValue={b.admin_note ?? ''} maxLength={2000} />
          <div className="row"><button type="submit">Simpan catatan</button></div>
        </form>
      </section>
    </>
  )
}
