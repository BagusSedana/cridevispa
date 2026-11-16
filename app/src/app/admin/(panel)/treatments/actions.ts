'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import { parsePriceForm, parseTreatmentForm } from '@/lib/admin/validate'

export type ActionState = { message: string; ok?: boolean } | null

function refreshPublic(treatmentId?: string) {
  revalidatePath('/', 'layout')
  revalidatePath('/admin/treatments')
  if (treatmentId) revalidatePath(`/admin/treatments/${treatmentId}`)
}

export async function saveTreatment(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin()
  const parsed = parseTreatmentForm(form)
  if (!parsed.ok) return { message: parsed.error }
  const id = String(form.get('id') ?? '')
  const db = await createServerClient()
  if (id) {
    const { error } = await db.from('treatments').update(parsed.data).eq('id', id)
    if (error) return { message: error.code === '23505' ? 'Nama ini sudah dipakai di kategori yang sama.' : 'Gagal menyimpan.' }
    refreshPublic(id)
    return { message: 'Tersimpan.', ok: true }
  }
  const { data, error } = await db.from('treatments').insert({ ...parsed.data, sort_order: 999 }).select('id').single()
  if (error) return { message: error.code === '23505' ? 'Nama ini sudah dipakai di kategori yang sama.' : 'Gagal menyimpan.' }
  refreshPublic(data.id)
  redirect(`/admin/treatments/${data.id}`)
}

export async function setTreatmentActive(id: string, active: boolean): Promise<void> {
  await requireAdmin()
  const db = await createServerClient()
  await db.from('treatments').update({ is_active: active }).eq('id', id)
  refreshPublic(id)
}

/** Swap sort_order with the neighbour above (-1) or below (+1) inside the same category. */
export async function moveTreatment(id: string, direction: -1 | 1): Promise<void> {
  await requireAdmin()
  const db = await createServerClient()
  const { data: me } = await db.from('treatments').select('id,category_id').eq('id', id).single()
  if (!me) return
  const { data: list } = await db.from('treatments').select('id,sort_order').eq('category_id', me.category_id).order('sort_order').order('name')
  if (!list) return
  const i = list.findIndex(t => t.id === id)
  const j = i + direction
  if (j < 0 || j >= list.length) return
  ;[list[i], list[j]] = [list[j], list[i]]
  await Promise.all(list.map((t, order) => db.from('treatments').update({ sort_order: order }).eq('id', t.id)))
  refreshPublic()
}

export async function savePrice(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin()
  const parsed = parsePriceForm(form)
  if (!parsed.ok) return { message: parsed.error }
  const treatmentId = String(form.get('treatment_id') ?? '')
  const id = String(form.get('id') ?? '')
  const db = await createServerClient()
  const { error } = id
    ? await db.from('treatment_prices').update(parsed.data).eq('id', id)
    : await db.from('treatment_prices').insert({ ...parsed.data, treatment_id: treatmentId, sort_order: 99 })
  if (error) return { message: 'Gagal menyimpan harga.' }
  refreshPublic(treatmentId)
  return { message: 'Harga tersimpan.', ok: true }
}

export async function deletePrice(id: string, treatmentId: string): Promise<void> {
  await requireAdmin()
  const db = await createServerClient()
  await db.from('treatment_prices').delete().eq('id', id)
  refreshPublic(treatmentId)
}
