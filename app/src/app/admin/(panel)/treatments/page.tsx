import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { formatRupiah } from '@/lib/price'
import { durationLabel } from '@/lib/catalog'
import { ActionForm } from '@/components/admin/ActionForm'
import { TreatmentFields } from './TreatmentFields'
import { moveTreatment, saveTreatment, setTreatmentActive } from './actions'

export const metadata = { title: 'Treatment & Harga · Admin CrideviSPA' }

export default async function TreatmentsPage() {
  const db = await createServerClient()
  const { data: categories } = await db
    .from('categories')
    .select('id,name_id,sort_order,treatments(id,name,is_active,sort_order,treatment_prices(id,duration_minutes,duration_label_id,duration_label_en,price_idr,sort_order))')
    .order('sort_order')
  const cats = categories ?? []

  return (
    <>
      <h1>Treatment &amp; Harga</h1>
      <p className="muted">Perubahan langsung tampil di website. Treatment yang disembunyikan tidak tampil ke pengunjung.</p>

      {cats.map(c => {
        const list = [...(c.treatments ?? [])].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
        return (
          <section key={c.id} className="panel">
            <h2>{c.name_id}</h2>
            {list.length === 0 && <p className="muted">Belum ada treatment.</p>}
            <div className="table-wrap">
              <table>
                <tbody>
                  {list.map((t, i) => (
                    <tr key={t.id}>
                      <td>
                        <Link href={`/admin/treatments/${t.id}`}><strong>{t.name}</strong></Link>
                        {!t.is_active && <> <span className="badge">Disembunyikan</span></>}
                        <div className="muted">
                          {[...(t.treatment_prices ?? [])].sort((a, b) => a.sort_order - b.sort_order)
                            .map(p => `${durationLabel(p.duration_minutes, p.duration_label_id, p.duration_label_en, 'id')}: ${formatRupiah(p.price_idr)}`).join(' · ') || 'Belum ada harga'}
                        </div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                        <form action={moveTreatment.bind(null, t.id, -1)} style={{ display: 'inline' }}><button className="btn-light" disabled={i === 0} aria-label={`Naikkan ${t.name}`}>↑</button></form>{' '}
                        <form action={moveTreatment.bind(null, t.id, 1)} style={{ display: 'inline' }}><button className="btn-light" disabled={i === list.length - 1} aria-label={`Turunkan ${t.name}`}>↓</button></form>{' '}
                        <form action={setTreatmentActive.bind(null, t.id, !t.is_active)} style={{ display: 'inline' }}><button className="btn-light">{t.is_active ? 'Sembunyikan' : 'Tampilkan'}</button></form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )
      })}

      <section className="panel">
        <h2>Tambah treatment baru</h2>
        <ActionForm action={saveTreatment} submitLabel="Tambah treatment">
          <TreatmentFields categories={cats} />
        </ActionForm>
      </section>
    </>
  )
}
