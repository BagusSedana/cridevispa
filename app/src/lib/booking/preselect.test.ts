import { describe, it, expect } from 'vitest'
import { parsePreselected } from './preselect'

const valid = new Set(Array.from({ length: 60 }, (_, i) => `id${i}`))

describe('parsePreselected (Review Focus 2)', () => {
  it('keeps valid ids in order', () => expect(parsePreselected('id1,id2', valid)).toEqual(['id1', 'id2']))
  it('drops unknown ids', () => expect(parsePreselected('id1,evil,id2', valid)).toEqual(['id1', 'id2']))
  it('removes duplicates', () => expect(parsePreselected('id1,id1,id1', valid)).toEqual(['id1']))
  it('caps at 10', () => expect(parsePreselected(Array.from({ length: 50 }, (_, i) => `id${i}`).join(','), valid)).toHaveLength(10))
  it('accepts repeated params', () => expect(parsePreselected(['id1', 'id2,id3'], valid)).toEqual(['id1', 'id2', 'id3']))
  it('undefined → []', () => expect(parsePreselected(undefined, valid)).toEqual([]))
})
