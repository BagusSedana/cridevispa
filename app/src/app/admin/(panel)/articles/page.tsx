import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { formatDateTimeId } from '@/lib/booking/labels'
import { setPublished } from './actions'

export const metadata = { title: 'Artikel · Admin CrideviSPA' }

export default async function ArticlesPage() {
  const db = await createServerClient()
  const { data: articles } = await db.from('articles').select('id,slug,title_id,published,updated_at,body_id,body_en').order('updated_at', { ascending: false })

  return (
    <>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1>Artikel</h1>
        <Link className="btn" href="/admin/articles/new">+ Artikel baru</Link>
      </div>
      {!articles?.length && <p className="panel muted">Belum ada artikel.</p>}
      {!!articles?.length && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Judul</th><th>Bahasa</th><th>Diubah</th><th>Status</th></tr></thead>
            <tbody>
              {articles.map(a => (
                <tr key={a.id}>
                  <td><Link href={`/admin/articles/${a.id}`}><strong>{a.title_id}</strong></Link><div className="muted">/artikel/{a.slug}</div></td>
                  <td className="muted">{[a.body_id?.trim() && 'ID', a.body_en?.trim() && 'EN'].filter(Boolean).join(' + ') || 'Kosong'}</td>
                  <td className="muted">{formatDateTimeId(a.updated_at)}</td>
                  <td>
                    <form action={setPublished.bind(null, a.id, !a.published)}>
                      <span className={`badge ${a.published ? '' : 'badge-new'}`}>{a.published ? 'Terbit' : 'Draft'}</span>{' '}
                      <button className="btn-light" type="submit">{a.published ? 'Jadikan draft' : 'Terbitkan'}</button>
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
