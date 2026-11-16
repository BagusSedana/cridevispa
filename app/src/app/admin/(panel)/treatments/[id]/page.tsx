import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { ActionForm } from '@/components/admin/ActionForm'
import { TreatmentFields } from '../TreatmentFields'
import { deletePrice, savePrice, saveTreatment } from '../actions'

export const metadata = { title: 'Edit Treatment · Admin CrideviSPA' }

type Price = { id: string; duration_minutes: number | null; duration_label_id: string | null; duration_label_en: string | null; price_idr: number; sort_order: number }

function PriceFields({ treatmentId, price }: { treatmentId: string; price?: Price }) {
  const p = price
  return (
    <>
      <input type="hidden" name="treatment_id" value={treatmentId} />
      {p && <input type="hidden" name="id" value={p.id} />}
      <div><label>Durasi (menit)</label><input name="duration_minutes" inputMode="numeric" defaultValue={p?.duration_minutes ?? ''} placeholder="60" /></div>
      <div><label>atau label (ID)</label><input name="duration_label_id" defaultValue={p?.duration_label_id ?? ''} placeholder="2,5 jam" /></div>
      <div><label>label (EN)</label><input name="duration_label_en" defaultValue={p?.duration_label_en ?? ''} placeholder="2.5 hours" /></div>
      <div><label>Harga (Rp)</label><input name="price_idr" inputMode="numeric" defaultValue={p?.price_idr ?? ''} placeholder="250000" required /></div>
    </>
  )
}

export default async function EditTreatment({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = await createServerClient()
  const [{ data: t }, { data: categories }] = await Promise.all([
    db.from('treatments').select('*,treatment_prices(*)').eq('id', id).maybeSingle(),
    db.from('categories').select('id,name_id').order('sort_order'),
  ])
  if (!t) notFound()
  const prices = [...((t.treatment_prices ?? []) as Price[])].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <>
      <p><Link href="/admin/treatments">← Semua treatment</Link></p>
      <h1>{t.name}</h1>

      <section className="panel">
        <h2>Detail</h2>
        <ActionForm action={saveTreatment} submitLabel="Simpan detail">
          <input type="hidden" name="id" value={t.id} />
          <TreatmentFields categories={categories ?? []} values={t} />
        </ActionForm>
      </section>

      <section className="panel">
        <h2>Harga</h2>
        <p className="muted">Isi durasi dalam menit (mis. 60), atau untuk paket isi label teks (mis. &quot;2,5 jam&quot;).</p>
        {prices.map(p => (
          <div key={p.id} className="panel">
            <ActionForm action={savePrice} submitLabel="Simpan" inline>
              <PriceFields treatmentId={t.id} price={p} />
            </ActionForm>
            <form action={deletePrice.bind(null, p.id, t.id)}><button className="btn-light">Hapus harga ini</button></form>
          </div>
        ))}
        <div className="panel">
          <strong>Tambah harga</strong>
          <ActionForm action={savePrice} submitLabel="Tambah" inline>
            <PriceFields treatmentId={t.id} />
          </ActionForm>
        </div>
      </section>
    </>
  )
}
