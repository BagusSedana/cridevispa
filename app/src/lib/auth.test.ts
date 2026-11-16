import { describe, it, expect } from 'vitest'
import { resolveAdminState } from './auth'

type Fake = Parameters<typeof resolveAdminState>[0]
const fake = (userId: string | null, isAdmin: boolean): Fake => ({
  auth: { getUser: async () => ({ data: { user: userId ? { id: userId } : null }, error: null }) },
  rpc: async () => ({ data: isAdmin, error: null }),
}) as unknown as Fake

describe('resolveAdminState', () => {
  it('no session → anon', async () => expect(await resolveAdminState(fake(null, false))).toEqual({ kind: 'anon' }))
  it('signed in, not in admins → not-admin', async () => expect(await resolveAdminState(fake('u1', false))).toEqual({ kind: 'not-admin' }))
  it('signed in admin → admin', async () => expect(await resolveAdminState(fake('u1', true))).toEqual({ kind: 'admin', userId: 'u1' }))
})
