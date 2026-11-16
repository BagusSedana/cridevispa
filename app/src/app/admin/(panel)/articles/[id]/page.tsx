import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { ActionForm } from '@/components/admin/ActionForm'
import { MarkdownField } from '../MarkdownField'
import { saveArticle } from '../actions'

export const metadata = { title: 'Edit Artikel · Admin CrideviSPA' }

type Row = Record<string, string | boolean | null>

export default async function EditArticle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let a: Row = {}
  if (id !== 'new') {
    const db = await createServerClient()
    const { data } = await db.from('articles').select('*').eq('id', id).maybeSingle()
    if (!data) notFound()
    a = data
  }
  const v = (k: string) => (typeof a[k] === 'string' ? (a[k] as string) : '')

  return (
    <>
      <p><Link href="/admin/articles">← Semua artikel</Link></p>
      <h1>{id === 'new' ? 'Artikel baru' : v('title_id')}</h1>
      {id !== 'new' && (
        <p className="muted">
          {a.published ? <>Terbit · <a href={`/artikel/${v('slug')}`} target="_blank" rel="noopener noreferrer">Lihat di website</a></> : 'Draft — belum terlihat pengunjung. Terbitkan dari daftar artikel.'}
        </p>
      )}

      <ActionForm action={saveArticle} submitLabel={id === 'new' ? 'Simpan draft' : 'Simpan perubahan'}>
        {id !== 'new' && <><input type="hidden" name="id" value={id} /><input type="hidden" name="old_slug" value={v('slug')} /></>}
        <section className="panel grid2">
          <div><label htmlFor="title_id">Judul (Indonesia)</label><input id="title_id" name="title_id" defaultValue={v('title_id')} required maxLength={160} /></div>
          <div><label htmlFor="title_en">Judul (English)</label><input id="title_en" name="title_en" defaultValue={v('title_en')} maxLength={160} /></div>
          <div>
            <label htmlFor="slug">Alamat (slug)</label>
            <input id="slug" name="slug" defaultValue={v('slug')} placeholder="otomatis dari judul" />
            <p className="muted">Jadi www.cridevispa.com/artikel/<strong>{v('slug') || 'judul-artikel'}</strong>. Mengubah slug artikel yang sudah terbit akan mengubah link-nya.</p>
          </div>
          <div><label htmlFor="category">Kategori</label><input id="category" name="category" defaultValue={v('category')} placeholder="Wellness & Health" /></div>
          <div><label htmlFor="excerpt_id">Ringkasan (Indonesia)</label><textarea id="excerpt_id" name="excerpt_id" defaultValue={v('excerpt_id')} style={{ minHeight: 80 }} /></div>
          <div><label htmlFor="excerpt_en">Ringkasan (English)</label><textarea id="excerpt_en" name="excerpt_en" defaultValue={v('excerpt_en')} style={{ minHeight: 80 }} /></div>
          <div><label htmlFor="meta_description_id">Deskripsi Google (Indonesia, ±155 huruf)</label><input id="meta_description_id" name="meta_description_id" defaultValue={v('meta_description_id')} maxLength={170} /></div>
          <div><label htmlFor="meta_description_en">Deskripsi Google (English)</label><input id="meta_description_en" name="meta_description_en" defaultValue={v('meta_description_en')} maxLength={170} /></div>
          <div>
            <label htmlFor="cover">Gambar sampul (JPG/PNG/WebP, maks 2 MB)</label>
            <input id="cover" name="cover" type="file" accept="image/jpeg,image/png,image/webp" />
            {v('cover_image_url') && <p className="muted">Sudah ada gambar. Pilih file baru untuk mengganti.</p>}
          </div>
          <div><label htmlFor="author">Penulis</label><input id="author" name="author" defaultValue={v('author') || 'CrideviSPA Team'} /></div>
        </section>
        <section className="panel">
          <MarkdownField name="body_id" label="Isi artikel (Indonesia)" defaultValue={v('body_id')} />
          <MarkdownField name="body_en" label="Isi artikel (English)" defaultValue={v('body_en')} />
        </section>
      </ActionForm>
    </>
  )
}
