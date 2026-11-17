'use client'
import { useEffect } from 'react'

/**
 * Behaviour of the legacy static site, applied to server-rendered markup:
 * scroll reveal (.reveal/.reveal-card → .visible), header shadow (.scrolled),
 * hamburger menu (.open) and FAQ accordion (.active). Content is in the HTML from the start.
 */
export function LegacyEffects() {
  useEffect(() => {
    const reveal = document.querySelectorAll('.reveal, .reveal-card')
    let io: IntersectionObserver | null = null
    if (typeof IntersectionObserver === 'undefined') {
      reveal.forEach(el => el.classList.add('visible'))
    } else {
      io = new IntersectionObserver(entries => {
        for (const e of entries) if (e.isIntersecting) { e.target.classList.add('visible'); io?.unobserve(e.target) }
      }, { rootMargin: '0px 0px -8% 0px' })
      reveal.forEach(el => io!.observe(el))
    }

    const header = document.getElementById('main-header')
    const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    document.querySelector('.hero-full')?.classList.add('loaded')

    const burger = document.getElementById('hamburger-btn')
    const mobileNav = document.getElementById('mobile-nav')
    const toggleMenu = () => {
      const open = !burger?.classList.contains('open')
      burger?.classList.toggle('open', open)
      mobileNav?.classList.toggle('open', open)
      burger?.setAttribute('aria-expanded', String(open))
      mobileNav?.setAttribute('aria-hidden', String(!open))
    }
    burger?.addEventListener('click', toggleMenu)

    const faqButtons = document.querySelectorAll<HTMLButtonElement>('.faq-question')
    const toggleFaq = (e: Event) => {
      const btn = e.currentTarget as HTMLButtonElement
      const item = btn.closest('.faq-item')
      const open = !item?.classList.contains('active')
      item?.classList.toggle('active', open)
      btn.setAttribute('aria-expanded', String(open))
    }
    faqButtons.forEach(b => b.addEventListener('click', toggleFaq))

    return () => {
      io?.disconnect()
      window.removeEventListener('scroll', onScroll)
      burger?.removeEventListener('click', toggleMenu)
      faqButtons.forEach(b => b.removeEventListener('click', toggleFaq))
    }
  }, [])
  return null
}
