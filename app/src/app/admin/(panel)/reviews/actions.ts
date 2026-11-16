'use server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'

export type ActionState = { message: string; ok?: boolean } | null

const text = (f: FormData, k: string) => String(f.get(k) ?? '').trim()

export async function saveReview(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin()
  const name = text(form, 'name')
  if (!name || name.length > 80) return { message: 'Nama wajib diisi (maks 80 huruf).' }
  const rating = Number(text(form, 'rating'))
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { message: 'Rating harus 1 sampai 5.' }
  const text_id = text(form, 'text_id')
  const text_en = text(form, 'text_en')
  if (!text_id && !text_en) return { message: 'Isi ulasan (Indonesia atau English) wajib diisi.' }
  const row = { name, origin: text(form, 'origin') || null, treatment: text(form, 'treatment') || null, rating, text_id, text_en }

  const db = await createServerClient()
  const id = text(form, 'id')
  const { error } = id
    ? await db.from('reviews').update(row).eq('id', id)
    : await db.from('reviews').insert({ ...row, published: false })
  if (error) return { message: 'Gagal menyimpan ulasan.' }
  revalidatePath('/')
  revalidatePath('/admin/reviews')
  return { message: id ? 'Ulasan tersimpan.' : 'Ulasan tersimpan (belum tampil — klik Tampilkan).', ok: true }
}

export async function setReviewPublished(id: string, published: boolean): Promise<void> {
  await requireAdmin()
  const db = await createServerClient()
  const { error } = await db.from('reviews').update({ published }).eq('id', id)
  if (error) throw new Error('Gagal mengubah status ulasan')
  revalidatePath('/')
  revalidatePath('/admin/reviews')
}
