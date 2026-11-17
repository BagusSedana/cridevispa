import { describe, it, expect, beforeEach, vi } from 'vitest'
import { addToSelection, clearSelection, readSelection, writeSelection } from './selection'

describe('booking selection (sessionStorage)', () => {
  beforeEach(() => {
    const store = new Map<string, string>()
    vi.stubGlobal('sessionStorage', { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v), removeItem: (k: string) => store.delete(k) })
  })
  it('adds without duplicates and clears', () => {
    addToSelection('a'); addToSelection('b'); addToSelection('a')
    expect(readSelection()).toEqual(['a', 'b'])
    clearSelection()
    expect(readSelection()).toEqual([])
  })
  it('caps at 10 and ignores garbage', () => {
    writeSelection(Array.from({ length: 15 }, (_, i) => `id${i}`))
    expect(readSelection()).toHaveLength(10)
    sessionStorage.setItem('cridevispa:booking-items', '{"not":"a list"}')
    expect(readSelection()).toEqual([])
  })
  it('never throws when storage is unavailable', () => {
    vi.stubGlobal('sessionStorage', undefined)
    expect(() => addToSelection('x')).not.toThrow()
    expect(readSelection()).toEqual([])
  })
})
