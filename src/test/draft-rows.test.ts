import { describe, expect, it } from 'vitest'
import { saved } from '#/components/draft-rows/data'
import {
  batch,
  duplicates,
  emptyDraft,
  formatDate,
  isBlank,
  parseAmount,
  toExpense,
  validate,
} from '#/components/draft-rows/drafts'
import type { Draft } from '#/components/draft-rows/drafts'

const draft = (over: Partial<Draft> = {}): Draft => ({
  id: 'd1',
  date: '2026-11-12',
  description: 'Taxi',
  category: 'Travel',
  amount: '42.80',
  ...over,
})

describe('validate', () => {
  it('accepts a complete row', () => {
    expect(validate(draft())).toEqual({})
  })

  it('rejects dates outside the report or in the future', () => {
    expect(validate(draft({ date: '2026-10-31' })).date).toMatch(/November/)
    expect(validate(draft({ date: '2026-11-20' })).date).toMatch(/future/)
    expect(validate(draft({ date: '' })).date).toBeDefined()
  })

  it('checks amounts', () => {
    expect(validate(draft({ amount: '' })).amount).toBe('Enter an amount')
    expect(validate(draft({ amount: 'abc' })).amount).toBe('Numbers only')
    expect(validate(draft({ amount: '0' })).amount).toBe('More than 0')
    expect(validate(draft({ amount: '1.234' })).amount).toBe('Cents at most')
    expect(validate(draft({ amount: '2500' })).amount).toMatch(/limit/)
    expect(validate(draft({ amount: '$1,250.50' }))).toEqual({})
    expect(validate(draft({ amount: '86.40' }))).toEqual({})
  })

  it('needs a description and a category', () => {
    const errors = validate(draft({ description: '  ', category: '' }))
    expect(Object.keys(errors).sort()).toEqual(['category', 'description'])
  })
})

describe('batch', () => {
  it('skips blank rows and counts the invalid ones', () => {
    const rows = [
      draft(),
      draft({ id: 'd2', amount: '' }),
      emptyDraft('d3', draft()),
    ]
    expect(isBlank(rows[2])).toBe(true)
    const b = batch(rows)
    expect(b.filled.map((d) => d.id)).toEqual(['d1', 'd2'])
    expect(b.invalid.map((d) => d.id)).toEqual(['d2'])
    expect(b.total).toBeCloseTo(42.8)
  })

  it('starts a new row on the date of the row above', () => {
    expect(emptyDraft('x', draft({ date: '2026-11-05' })).date).toBe(
      '2026-11-05',
    )
  })
})

describe('duplicates', () => {
  it('flags a draft that repeats a saved expense', () => {
    const copy = draft({
      date: '2026-11-04',
      description: 'client dinner ',
      category: 'Meals',
      amount: '148.5',
    })
    expect(duplicates([copy], saved)).toEqual(new Set(['d1']))
  })

  it('flags the second of two identical drafts only', () => {
    const rows = [
      draft(),
      draft({ id: 'd2' }),
      draft({ id: 'd3', amount: '9' }),
    ]
    expect(duplicates(rows, [])).toEqual(new Set(['d2']))
  })
})

describe('saving', () => {
  it('turns a draft into an expense', () => {
    expect(
      toExpense(draft({ description: ' Taxi ', amount: '1,042.80' }), 'e9'),
    ).toEqual({
      id: 'e9',
      date: '2026-11-12',
      description: 'Taxi',
      category: 'Travel',
      amount: 1042.8,
    })
  })

  it('formats without time zone drift', () => {
    expect(formatDate('2026-11-01')).toBe('Nov 1')
    expect(parseAmount('$ 12')).toBe(12)
  })
})
