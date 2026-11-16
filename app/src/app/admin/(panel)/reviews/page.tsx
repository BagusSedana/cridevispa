import { createServerClient } from '@/lib/supabase/server'
import { ActionForm } from '@/components/admin/ActionForm'
import { saveReview, setReviewPublished } from './actions'

export const metadata = { title: 'Ulasan · Admin CrideviSPA' }

export default async function ReviewsAdmin() {
  const db = await createServerClient()
  const { data: reviews, error } = await db.from('reviews').select('*').order('created_at', { ascending: false })

  return (
    <>
      <h1>Ulasan Tamu</h1>
      <p className="muted">Masukkan hanya ulasan asli dari tamu (misalnya dari chat WhatsApp atau Google), dengan izin mereka. Bagian ulasan di website tersembunyi otomatis selama belum ada ulasan yang ditampilkan.</p>
      {error && <p className="msg msg-err">Tabel ulasan belum dibuat. Jalankan SQL migrasi 004 di Supabase.</p>}

      <section className="panel">
        <h2>Tambah ulasan</h2>
        <ActionForm action={saveReview} submitLabel="Simpan ulasan">
          <div className="grid2">
            <div><label htmlFor="name">Nama tamu</label><input id="name" name="name" maxLength={80} required placeholder="mis. Made" /></div>
            <div><label htmlFor="origin">Asal / tempat (opsional)</label><input id="origin" name="origin" maxLength={120} placeholder="mis. Tamu villa Seminyak" /></div>
            <div><label htmlFor="treatment">Treatment (opsional)</label><input id="treatment" name="treatment" maxLength={120} placeholder="mis. Balinese Massage" /></div>
            <div>
              <label htmlFor="rating">Rating</label>
              <select id="rating" name="rating" defaultValue="5">{[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{'★'.repeat(n)} ({n})</option>)}</select>
            </div>
            <div><label htmlFor="text_id">Ulasan (Indonesia)</label><textarea id="text_id" name="text_id" maxLength={600} /></div>
            <div><label htmlFor="text_en">Ulasan (English)</label><textarea id="text_en" name="text_en" maxLength={600} /></div>
          </div>
        </ActionForm>
      </section>

      {!!reviews?.length && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Tamu</th><th>Ulasan</th><th>Status</th></tr></thead>
            <tbody>
              {reviews.map(r => (
                <tr key={r.id}>
                  <td><strong>{r.name}</strong><div className="muted">{[r.origin, r.treatment].filter(Boolean).join(' · ')}</div><div>{'★'.repeat(r.rating)}</div></td>
                  <td>{r.text_id || r.text_en}</td>
                  <td>
                    <form action={setReviewPublished.bind(null, r.id, !r.published)}>
                      <span className={`badge ${r.published ? '' : 'badge-new'}`}>{r.published ? 'Tampil' : 'Disembunyikan'}</span>{' '}
                      <button className="btn-light" type="submit">{r.published ? 'Sembunyikan' : 'Tampilkan'}</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
