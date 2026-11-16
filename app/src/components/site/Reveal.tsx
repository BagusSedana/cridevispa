'use client'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import s from './site.module.css'

/** Fades children in when scrolled into view. Content is in the HTML from the start (SEO); reduced motion = no animation. */
export function Reveal({ children, as: Tag = 'div', className = '' }: { children: ReactNode; as?: 'div' | 'section'; className?: string }) {
  const ref = useRef<HTMLElement | null>(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') { setShown(true); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect() } }, { rootMargin: '0px 0px -10% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <Tag ref={ref as never} className={`${s.reveal} ${shown ? s.revealIn : ''} ${className}`}>{children}</Tag>
}
