'use client'
import { SiteShell } from '@/components/site/SiteShell'
import { waLink } from '@/lib/links'

/** Shown when a public page fails (e.g. database outage): keep the chrome and a way to book. */
export default function SiteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <SiteShell lang="id" path="/">
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '80px 16px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 36, marginBottom: 12 }}>Halaman sedang bermasalah</h1>
        <p>Maaf, halaman ini tidak bisa dimuat saat ini. Anda tetap bisa booking langsung via WhatsApp.<br /><em>This page could not be loaded right now — you can still book on WhatsApp.</em></p>
        <p style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
          <a className="btn-solid" href={waLink('id')} target="_blank" rel="noopener noreferrer">Booking via WhatsApp</a>
          <button className="btn-split" onClick={reset}>Coba lagi</button>
        </p>
      </div>
    </SiteShell>
  )
}
