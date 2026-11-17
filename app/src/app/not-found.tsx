import { SiteShell } from '@/components/site/SiteShell'
import { waLink } from '@/lib/links'

export const metadata = { title: 'Halaman tidak ditemukan', robots: { index: false } }

export default function NotFound() {
  return (
    <SiteShell lang="id" path="/">
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '80px 16px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 40, marginBottom: 12 }}>Halaman tidak ditemukan</h1>
        <p>Halaman yang Anda cari tidak ada. <em>The page you are looking for does not exist.</em></p>
        <p style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
          <a className="btn-split" href="/">Beranda</a>
          <a className="btn-solid" href={waLink('id')} target="_blank" rel="noopener noreferrer">WhatsApp</a>
        </p>
      </div>
    </SiteShell>
  )
}
