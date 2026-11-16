import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { formatRupiah } from '@/lib/price'
import { BOOKING_STATUSES, type BookingStatus } from '@/lib/types'
import { STATUS_LABEL, formatDateId, formatDateTimeId } from '@/lib/booking/labels'

export const metadata = { title: 'Booking · Admin CrideviSPA' }

type Search = { status?: string; from?: string; to?: string }

export default async function BookingsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { status, from, to } = await searchParams
  const db = await createServerClient()
  let query = db.from('bookings')
    .select('id,created_at,status,name,phone,booking_date,booking_time,total_idr')
    .order('created_at', { ascending: false })
    .limit(200)
  if (status && BOOKING_STATUSES.includes(status as BookingStatus)) query = query.eq('status', status)
  if (from) query = query.gte('booking_date', from)
  if (to) query = query.lte('booking_date', to)
  const { data: bookings, error } = await query

  return (
    <>
      <h1>Booking</h1>
      <form className="row" method="get">
        <div>
          <label htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={status ?? ''}>
            <option value="">Semua</option>
            {BOOKING_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </div>
        <div><label htmlFor="from">Dari tanggal</label><input id="from" name="from" type="date" defaultValue={from} /></div>
        <div><label htmlFor="to">Sampai</label><input id="to" name="to" type="date" defaultValue={to} /></div>
        <button type="submit">Filter</button>
        <Link className="btn btn-light" href="/admin">Reset</Link>
      </form>

      {error && <p className="msg msg-err">Gagal memuat booking.</p>}
      {!error && bookings?.length === 0 && <p className="panel muted">Belum ada booking.</p>}
      {!!bookings?.length && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Masuk</th><th>Nama</th><th>Jadwal</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td className="muted">{formatDateTimeId(b.created_at)}</td>
                  <td><Link href={`/admin/bookings/${b.id}`}><strong>{b.name}</strong></Link><div className="muted">+{b.phone}</div></td>
                  <td>{formatDateId(b.booking_date)}<div className="muted">{b.booking_time.slice(0, 5)} WITA</div></td>
                  <td>{formatRupiah(b.total_idr)}</td>
                  <td><span className={`badge ${b.status === 'new' ? 'badge-new' : ''}`}>{STATUS_LABEL[b.status as BookingStatus]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
