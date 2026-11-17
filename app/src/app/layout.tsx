import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import { SITE_URL } from '@/lib/seo'
import './globals.css'

const serif = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '600'], style: ['normal', 'italic'], variable: '--font-serif', display: 'swap' })
const sans = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-sans', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'CrideviSPA | Home Service Massage · Denpasar, Bali', template: '%s | CrideviSPA' },
  description: 'Home service massage dan spa di Denpasar, Bali. Pijat Bali, refleksi, facial dan paket relaksasi langsung ke villa atau rumah Anda.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180' },
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="id" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  )
}
