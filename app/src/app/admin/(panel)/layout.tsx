import Link from 'next/link'
import '../admin.css'
import { requireAdmin } from '@/lib/auth'
import { signOut } from '../(auth)/actions'

export const metadata = { title: 'Admin CrideviSPA', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()
  return (
    <div className="adm">
      <header className="adm-top">
        <strong>CrideviSPA Admin</strong>
        <nav aria-label="Menu admin">
          <Link href="/admin">Booking</Link>
          <Link href="/admin/treatments">Treatment &amp; Harga</Link>
          <Link href="/admin/articles">Artikel</Link>
        </nav>
        <form action={signOut}><button className="btn-light" type="submit">Keluar</button></form>
      </header>
      <main className="adm-main">{children}</main>
    </div>
  )
}
