'use client'
import { useActionState, type ReactNode } from 'react'

type State = { message: string; ok?: boolean } | null

export function ActionForm({ action, submitLabel, children, inline = false }: {
  action: (state: State, form: FormData) => Promise<State>
  submitLabel: string
  children: ReactNode
  inline?: boolean
}) {
  const [state, formAction, pending] = useActionState(action, null)
  return (
    <form action={formAction} className={inline ? 'row' : undefined}>
      {children}
      <div className="row">
        <button type="submit" disabled={pending}>{pending ? 'Menyimpan…' : submitLabel}</button>
        {state?.message && <span className={`msg ${state.ok ? 'msg-ok' : 'msg-err'}`} role="status">{state.message}</span>}
      </div>
    </form>
  )
}
