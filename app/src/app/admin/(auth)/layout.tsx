import '../admin.css'

export const metadata = { robots: { index: false, follow: false } }

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="adm adm-auth"><div className="adm-card">{children}</div></div>
}
