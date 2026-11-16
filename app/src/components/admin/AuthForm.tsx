'use client'
import { useActionState, type ReactNode } from 'react'

type FormState = { message: string; ok?: boolean } | null

export function AuthForm({ action, submitLabel, children }: {
  action: (state: FormState, form: FormData) => Promise<FormState>
  submitLabel: string
  children: ReactNode
}) {
  const [state, formAction, pending] = useActionState(action, null)
  return (
    <form action={formAction}>
      {children}
      <button className="btn-block" type="submit" disabled={pending}>{pending ? 'Memproses…' : submitLabel}</button>
      {state?.message && <p className={`msg ${state.ok ? 'msg-ok' : 'msg-err'}`} role="status">{state.message}</p>}
    </form>
  )
}
