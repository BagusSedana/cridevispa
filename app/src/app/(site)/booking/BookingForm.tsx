'use client'
import { useMemo, useState } from 'react'
import type { CategoryWithTreatments } from '@/lib/types'
import type { Lang } from '@/lib/i18n'
import { t as copy } from '@/content/copy'
import { formatRupiah } from '@/lib/price'
import { buildWaMessage, buildWaUrl } from '@/lib/booking/whatsapp'
import s from './booking.module.css'

type Picked = { id: string; name: string; durationLabel: string; priceIdr: number }

/** Booking form. Records the booking via /api/bookings, then opens WhatsApp; never blocked by an API failure. */
export function BookingForm({ catalog, lang, initialIds }: { catalog: CategoryWithTreatments[]; lang: Lang; initialIds: string[] }) {
  const c = copy(lang).booking
  const options = useMemo(() => catalog.flatMap(cat => cat.treatments.flatMap(tr => tr.prices.map(p => ({ id: p.id, category: cat.name, name: tr.name, durationLabel: p.durationLabel, priceIdr: p.priceIdr })))), [catalog])
  const [picked, setPicked] = useState<Picked[]>(() => initialIds.map(id => options.find(o => o.id === id)).filter((o): o is Picked & { category: string } => Boolean(o)))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const total = picked.reduce((n, p) => n + p.priceIdr, 0)

  function toggle(o: Picked) {
    setPicked(cur => cur.some(x => x.id === o.id) ? cur.filter(x => x.id !== o.id) : [...cur, o])
  }

  async function submit(form: HTMLFormElement) {
    setError('')
    if (!picked.length) { setError(c.pickOne); return }
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
      if (res.status === 400) { setError(json.error ?? c.invalid); return }
      window.open(res.ok && json.waUrl ? json.waUrl : fallback, '_blank', 'noopener')
    } catch {
      window.open(fallback, '_blank', 'noopener')
    } finally {
      clearTimeout(timer)
      setBusy(false)
    }
  }

  let lastCategory = ''
  return (
    <form className={s.form} onSubmit={e => { e.preventDefault(); submit(e.currentTarget) }}>
      <fieldset className={s.box}>
        <legend>{c.selected}</legend>
        <div className={s.options}>
          {options.map(o => {
            const on = picked.some(x => x.id === o.id)
            const header = o.category !== lastCategory ? (lastCategory = o.category) : null
            return (
              <div key={o.id}>
                {header && <p className={s.cat}>{header}</p>}
                <label className={`${s.opt} ${on ? s.optOn : ''}`}>
                  <input type="checkbox" checked={on} onChange={() => toggle(o)} />
                  <span className={s.optName}>{o.name}<small>{o.durationLabel}</small></span>
                  <strong>{formatRupiah(o.priceIdr)}</strong>
                </label>
              </div>
            )
          })}
        </div>
        <p className={s.total}><span>{c.total}</span><strong>{formatRupiah(total)}</strong></p>
      </fieldset>

      <fieldset className={s.box}>
        <div className={s.grid}>
          <label>{c.name}<input name="name" required maxLength={120} autoComplete="name" /></label>
          <label>{c.phone}<input name="phone" required inputMode="tel" autoComplete="tel" /></label>
          <label>{c.email}<input name="email" type="email" autoComplete="email" /></label>
          <label>{c.date}<input name="date" type="date" required /></label>
          <label>{c.time}<input name="time" type="time" min="07:00" max="22:00" required /></label>
        </div>
        <label>{c.message}<textarea name="message" maxLength={1000} rows={3} /></label>
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className={s.hp} />
        <p className={s.note}>{c.note}</p>
        {error && <p role="alert" className={s.err}>{error}</p>}
        <button className={s.submit} type="submit" disabled={busy}>{busy ? c.sending : c.submit}</button>
      </fieldset>
    </form>
  )
}
