'use client'
import { useMemo, useState } from 'react'
import type { CategoryWithTreatments } from '@/lib/types'
import type { Lang } from '@/lib/i18n'
import { formatRupiah } from '@/lib/price'
import { buildWaMessage, buildWaUrl } from '@/lib/booking/whatsapp'

type Picked = { id: string; name: string; durationLabel: string; priceIdr: number }

/** Temporary booking form (phase 3 replaces the look). Never blocks WhatsApp if the API fails. */
export function BookingForm({ catalog, lang }: { catalog: CategoryWithTreatments[]; lang: Lang }) {
  const [picked, setPicked] = useState<Picked[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const total = useMemo(() => picked.reduce((n, p) => n + p.priceIdr, 0), [picked])
  const t = (id: string, en: string) => (lang === 'en' ? en : id)

  async function submit(form: HTMLFormElement) {
    setError('')
    if (!picked.length) { setError(t('Pilih minimal 1 treatment.', 'Choose at least 1 treatment.')); return }
    const f = new FormData(form)
    const payload = {
      name: String(f.get('name') ?? ''), phone: String(f.get('phone') ?? ''), email: String(f.get('email') ?? ''),
      date: String(f.get('date') ?? ''), time: String(f.get('time') ?? ''), message: String(f.get('message') ?? ''),
      website: String(f.get('website') ?? ''), lang, items: picked.map(p => ({ treatmentPriceId: p.id })),
    }
    const fallback = buildWaUrl(buildWaMessage(lang, { ...payload, items: picked, totalIdr: total }))
    setBusy(true)
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 3000)
    try {
      const res = await fetch('/api/bookings', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload), signal: controller.signal })
      const json = await res.json().catch(() => ({}))
      if (res.status === 400) { setError(json.error ?? t('Data belum lengkap.', 'Please check the form.')); return }
      window.open(res.ok && json.waUrl ? json.waUrl : fallback, '_blank', 'noopener')
    } catch {
      window.open(fallback, '_blank', 'noopener')
    } finally {
      clearTimeout(timer)
      setBusy(false)
    }
  }

  return (
    <form onSubmit={e => { e.preventDefault(); submit(e.currentTarget) }}>
      {catalog.map(c => (
        <fieldset key={c.key}>
          <legend>{c.name}</legend>
          {c.treatments.flatMap(tr => tr.prices.map(p => {
            const on = picked.some(x => x.id === p.id)
            return (
              <label key={p.id} className="opt">
                <input type="checkbox" checked={on} onChange={() => setPicked(on ? picked.filter(x => x.id !== p.id) : [...picked, { id: p.id, name: tr.name, durationLabel: p.durationLabel, priceIdr: p.priceIdr }])} />
                <span>{tr.name} · {p.durationLabel}</span><strong>{formatRupiah(p.priceIdr)}</strong>
              </label>
            )
          }))}
        </fieldset>
      ))}
      <p><strong>{t('Total perkiraan', 'Estimated total')}: {formatRupiah(total)}</strong></p>
      <label>{t('Nama', 'Name')}<input name="name" required maxLength={120} autoComplete="name" /></label>
      <label>{t('No. HP / WhatsApp', 'Phone / WhatsApp')}<input name="phone" required inputMode="tel" autoComplete="tel" /></label>
      <label>Email ({t('opsional', 'optional')})<input name="email" type="email" autoComplete="email" /></label>
      <label>{t('Tanggal', 'Date')}<input name="date" type="date" required /></label>
      <label>{t('Jam (07:00–22:00 WITA)', 'Time (07:00–22:00 WITA)')}<input name="time" type="time" min="07:00" max="22:00" required /></label>
      <label>{t('Alamat / pesan', 'Address / notes')}<textarea name="message" maxLength={1000} /></label>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }} />
      {error && <p role="alert" className="err">{error}</p>}
      <button type="submit" disabled={busy}>{busy ? t('Memproses…', 'Sending…') : t('Booking via WhatsApp', 'Book via WhatsApp')}</button>
    </form>
  )
}
