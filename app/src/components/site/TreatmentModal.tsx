'use client'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { TreatmentIcon } from './TreatmentIcon'

export type ModalTreatment = { name: string; desc: string; dur: string; price: string; img: string; icon: string | null; href: string }

/**
 * Legacy "More info" popup: clicking a booking link marked data-treatment shows the treatment's
 * photo, description and price first; the button inside continues to the booking form.
 * Without JS the link goes straight to /booking.
 */
export function TreatmentModal({ bookLabel, closeLabel }: { bookLabel: string; closeLabel: string }) {
  const [item, setItem] = useState<ModalTreatment | null>(null)
  const opener = useRef<HTMLElement | null>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => {
    setItem(null)
    opener.current?.focus()
  }, [])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const link = (e.target as Element).closest<HTMLAnchorElement>('a[data-treatment]')
      if (!link) return
      try {
        const data = JSON.parse(link.dataset.treatment ?? '') as Omit<ModalTreatment, 'href'>
        e.preventDefault()
        opener.current = link
        setItem({ ...data, href: link.href })
      } catch { /* malformed data: let the link navigate */ }
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  useEffect(() => {
    if (!item) return
    closeBtn.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [item, close])

  if (!item) return null
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="treatment-modal-title">
      <div className="modal-overlay" onClick={close} />
      <div className="modal-content">
        <button ref={closeBtn} type="button" className="modal-close" onClick={close} aria-label={closeLabel}>×</button>
        <div className="modal-body">
          <Image className="m-img" src={item.img} alt="" width={480} height={270} sizes="480px" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div className="t-row-icon-box" style={{ width: 36, height: 36, background: 'rgba(201,169,110,0.12)', color: 'var(--gold)' }} aria-hidden="true"><TreatmentIcon icon={item.icon} /></div>
            <h3 id="treatment-modal-title" className="m-title" style={{ marginBottom: 0 }}>{item.name}</h3>
          </div>
          {item.desc && <p className="m-desc">{item.desc}</p>}
          <div className="m-price-box"><span>{item.dur}</span><span>{item.price}</span></div>
          <a className="m-book-btn" href={item.href}>{bookLabel} →</a>
        </div>
      </div>
    </div>
  )
}
