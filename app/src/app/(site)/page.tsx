import { redirect } from 'next/navigation'

// The public home page is still served by the static site until phase 3.
export default function Home() {
  redirect('/artikel')
}
