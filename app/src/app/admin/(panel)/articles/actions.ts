'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import { parseArticleForm, validateCoverFile } from '@/lib/admin/validate'

export type ActionState = { message: string; ok?: boolean } | null

function refresh(slug?: string, oldSlug?: string) {
  revalidatePath('/artikel')
  revalidatePath('/sitemap.xml')
  revalidatePath('/admin/articles')
  for (const s of [slug, oldSlug]) if (s) revalidatePath(`/artikel/${s}`)
}

async function uploadCover(db: Awaited<ReturnType<typeof createServerClient>>, form: FormData): Promise<{ url?: string; error?: string }> {
  const file = form.get('cover')
  if (!(file instanceof File) || file.size === 0) return {}
  const problem = validateCoverFile(file)
  if (problem) return { error: problem }
  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `covers/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await db.storage.from('article-images').upload(path, file, { contentType: file.type })
  if (error) return { error: 'Upload gambar gagal.' }
  return { url: db.storage.from('article-images').getPublicUrl(path).data.publicUrl }
}

export async function saveArticle(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin()
  const parsed = parseArticleForm(form)
  if (!parsed.ok) return { message: parsed.error }
  const db = await createServerClient()
  const cover = await uploadCover(db, form)
  if (cover.error) return { message: cover.error }
  const row = { ...parsed.data, ...(cover.url ? { cover_image_url: cover.url } : {}) }
  const duplicate = { message: `Slug "${row.slug}" sudah dipakai artikel lain. Ganti slug-nya.` }

  const id = String(form.get('id') ?? '')
  if (id) {
    const oldSlug = String(form.get('old_slug') ?? '')
    const { error } = await db.from('articles').update(row).eq('id', id)
    if (error) return error.code === '23505' ? duplicate : { message: 'Gagal menyimpan artikel.' }
    refresh(row.slug, oldSlug)
    return { message: 'Artikel tersimpan.', ok: true }
  }
  const { data, error } = await db.from('articles').insert(row).select('id').single()
  if (error) return error.code === '23505' ? duplicate : { message: 'Gagal menyimpan artikel.' }
  refresh(row.slug)
  redirect(`/admin/articles/${data.id}`)
}

export async function setPublished(id: string, published: boolean): Promise<void> {
  await requireAdmin()
  const db = await createServerClient()
  const { data: current } = await db.from('articles').select('slug,published_at').eq('id', id).single()
  await db.from('articles').update({
    published,
    ...(published && !current?.published_at ? { published_at: new Date().toISOString() } : {}),
  }).eq('id', id)
  refresh(current?.slug)
}
