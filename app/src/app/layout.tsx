import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'CrideviSPA | Home Service Massage · Denpasar, Bali', template: '%s | CrideviSPA' },
  description: 'Home service massage dan spa di Denpasar, Bali. Pijat Bali, refleksi, facial dan paket relaksasi langsung ke villa atau rumah Anda.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
