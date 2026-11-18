import { describe, expect, it } from 'vitest'
import { draft, people } from '#/components/schedule-matrix/data'
import {
  assign,
  changes,
  conflicts,
  coverage,
  fromKey,
  gaps,
  hours,
  load,
  restBefore,
} from '#/components/schedule-matrix/schedule'

const person = (id: string) => people.find((p) => p.id === id)!

describe('assign', () => {
  it('changes one cell and leaves the draft untouched', () => {
    const next = assign(draft, 'tom', 5, 'late')
    expect(next.tom[5]).toBe('late')
    expect(draft.tom[5]).toBeNull()
    expect(next.amara).toBe(draft.amara)
  })

  it('returns the same schedule when nothing changes', () => {
    expect(assign(draft, 'tom', 1, 'late')).toBe(draft)
  })
})

describe('coverage and gaps', () => {
  it('counts people per shift, ignoring leave', () => {
    expect(coverage(draft, 0)).toEqual({ early: 2, late: 1, night: 1 })
  })

  it('finds the short shifts in the draft', () => {
    expect(gaps(draft)).toEqual([
      { day: 0, shift: 'late', have: 1, need: 2 },
      { day: 5, shift: 'late', have: 0, need: 1 },
    ])
  })

  it('closes a gap once someone takes the shift', () => {
    const next = assign(draft, 'tom', 5, 'late')
    expect(gaps(next).map((g) => g.day)).toEqual([0])
  })
})

describe('rest', () => {
  it('measures rest from the end of the previous shift', () => {
    expect(restBefore(['late', 'early'], 1)).toBe(8)
    expect(restBefore(['night', 'early'], 1)).toBe(0)
    expect(restBefore(['night', 'night'], 1)).toBe(16)
    expect(restBefore(['early', 'late'], 1)).toBe(24)
  })

  it('ignores days off and leave', () => {
    expect(restBefore([null, 'early'], 1)).toBeNull()
    expect(restBefore(['leave', 'early'], 1)).toBeNull()
  })

  it('flags only Tom in the draft', () => {
    expect(conflicts(draft)).toEqual([{ personId: 'tom', day: 2, rest: 8 }])
  })
})

describe('hours', () => {
  it('counts leave toward the contract', () => {
    expect(hours(draft.chloe)).toBe(40)
    expect(load(person('chloe'), draft.chloe).status).toBe('exact')
  })

  it('reports overtime and free hours', () => {
    expect(load(person('jonas'), draft.jonas)).toEqual({
      hours: 48,
      diff: 8,
      status: 'over',
    })
    expect(load(person('tom'), draft.tom)).toMatchObject({
      diff: -16,
      status: 'under',
    })
  })
})

describe('editing', () => {
  it('tracks cells that differ from the published schedule', () => {
    let next = assign(draft, 'tom', 5, 'late')
    next = assign(next, 'jonas', 6, null)
    expect([...changes(draft, next)]).toEqual(['tom:5', 'jonas:6'])
    expect(changes(draft, assign(next, 'tom', 5, null)).size).toBe(1)
  })

  it('maps typed keys to shifts', () => {
    expect(fromKey('e')).toBe('early')
    expect(fromKey('N')).toBe('night')
    expect(fromKey('a')).toBe('leave')
    expect(fromKey('Delete')).toBeNull()
    expect(fromKey('x')).toBeUndefined()
  })
})
