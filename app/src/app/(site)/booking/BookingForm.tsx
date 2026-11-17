'use client'
import { useMemo, useState, type ReactNode } from 'react'
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
      // Same-tab navigation: iOS Safari blocks window.open after an awaited fetch.
      window.location.assign(res.ok && json.waUrl ? json.waUrl : fallback)
    } catch {
      window.location.assign(fallback)
    } finally {
      clearTimeout(timer)
      setBusy(false)
    }
  }

  let lastCategory = ''
  const field = (label: string, input: ReactNode) => <div className="form-group"><label className="form-label">{label}{input}</label></div>
  return (
    <div className="booking-layout">
      <div className="booking-form-col">
        <form className="booking-form" onSubmit={e => { e.preventDefault(); submit(e.currentTarget) }}>
          <fieldset className="form-group" style={{ border: 0, padding: 0, margin: '0 0 20px', minWidth: 0 }}>
            <legend className="form-label">{c.selected}</legend>
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
          </fieldset>
          {field(c.date, <input className="form-input" name="date" type="date" required />)}
          {field(c.time, <input className="form-input" name="time" type="time" min="07:00" max="22:00" required />)}
          {field(c.name, <input className="form-input" name="name" required maxLength={120} autoComplete="name" />)}
          {field(c.phone, <input className="form-input" name="phone" required inputMode="tel" autoComplete="tel" />)}
          {field(c.email, <input className="form-input" name="email" type="email" autoComplete="email" />)}
          <div className="form-note"><p>{c.note}</p></div>
          {field(c.message, <textarea className="form-input" name="message" maxLength={1000} rows={4} />)}
          <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className={s.hp} />
          {error && <p role="alert" className={s.err}>{error}</p>}
          <button className="btn-submit-booking" type="submit" disabled={busy}>{busy ? c.sending : c.submit}</button>
        </form>
      </div>

      <aside className="booking-summary-col" aria-label={c.selected}>
        <div className="summary-categories"><span className="s-cat active">{c.selected}</span></div>
        <div className="summary-list" aria-live="polite">
          {picked.length === 0 && <p className="summary-placeholder">{c.pickOne}</p>}
          {picked.length > 0 && (
            <>
              <div className="summary-items-wrap">
                {picked.map(p => (
                  <div key={p.id} className="summary-item">
                    <div className="summary-item-left">
                      <div className="summary-item-title">{p.name}</div>
                      <div className="summary-item-meta">{p.durationLabel} · <strong>{formatRupiah(p.priceIdr)}</strong></div>
                    </div>
                    <button type="button" className="summary-item-remove" onClick={() => toggle(p)} aria-label={`× ${p.name}`}>×</button>
                  </div>
                ))}
              </div>
              <div className="summary-total-row"><span>{c.total}</span><span className="summary-total-amount">{formatRupiah(total)}</span></div>
            </>
          )}
        </div>
      </aside>
    </div>
  )
}
