import { describe, expect, it } from 'vitest'
import { changes, rows } from '#/components/change-review/data'
import {
  WHOLE,
  apply,
  changeKey,
  changedFields,
  decide,
  delta,
  diffLines,
  inView,
  keysOf,
  rowState,
  tally,
} from '#/components/change-review/diff'

const byId = (id: string) => changes.find((c) => c.id === id)!

describe('changes', () => {
  it('finds the changed fields by comparing before and after', () => {
    expect(changedFields(byId('p3'))).toEqual(['price', 'stock', 'status'])
    expect(changedFields(byId('p5'))).toEqual(['name'])
    expect(keysOf(byId('p9'))).toEqual([changeKey('p9', WHOLE)])
  })

  it('describes how numbers moved', () => {
    expect(delta('price', 249, 269)).toBe('+8.0%')
    expect(delta('price', 59, 54)).toBe('-8.5%')
    expect(delta('stock', 12, 40)).toBe('+28')
    expect(delta('name', 'a', 'b')).toBeNull()
  })
})

describe('decisions', () => {
  const p3 = byId('p3')

  it('derives the row state from its fields', () => {
    expect(rowState(p3, {})).toBe('pending')
    let d = decide({}, [changeKey('p3', 'price')], 'accepted')
    expect(rowState(p3, d)).toBe('partial')
    d = decide(
      d,
      [changeKey('p3', 'stock'), changeKey('p3', 'status')],
      'rejected',
    )
    expect(rowState(p3, d)).toBe('mixed')
    expect(rowState(p3, decide(d, keysOf(p3), 'accepted'))).toBe('accepted')
    expect(rowState(p3, decide(d, keysOf(p3), null))).toBe('pending')
  })

  it('puts rows in the right views', () => {
    expect(inView('partial', 'review')).toBe(true)
    expect(inView('mixed', 'accepted')).toBe(true)
    expect(inView('mixed', 'rejected')).toBe(true)
    expect(inView('accepted', 'review')).toBe(false)
  })

  it('counts every change once', () => {
    const d = decide({}, keysOf(p3), 'accepted')
    expect(tally(changes, d)).toEqual({
      total: 17,
      accepted: 3,
      rejected: 0,
      pending: 14,
    })
  })
})

describe('apply', () => {
  it('leaves everything as it was until something is accepted', () => {
    const catalog = apply(changes, {})
    expect(catalog.map((p) => p.id)).not.toContain('p9')
    expect(catalog.find((p) => p.id === 'p1')?.price).toBe(249)
    expect(catalog.find((p) => p.id === 'p11')).toBeDefined()
  })

  it('applies accepted fields only, and adds or removes accepted records', () => {
    let d = decide({}, [changeKey('p2', 'price')], 'accepted')
    d = decide(d, [changeKey('p2', 'stock')], 'rejected')
    d = decide(d, [changeKey('p9', WHOLE), changeKey('p11', WHOLE)], 'accepted')
    const catalog = apply(changes, d)
    expect(catalog.find((p) => p.id === 'p2')).toMatchObject({
      price: 199,
      stock: 12,
    })
    expect(catalog.map((p) => p.id)).toContain('p9')
    expect(catalog.map((p) => p.id)).not.toContain('p11')
    expect(catalog).toHaveLength(9)
  })
})

describe('catalog and diff', () => {
  it('lists every product in SKU order, with changes where there are some', () => {
    expect(rows).toHaveLength(16)
    const skus = rows.map((r) => r.product.sku)
    expect(skus).toEqual([...skus].sort())
    expect(rows.filter((r) => r.change)).toHaveLength(changes.length)
  })

  it('shows unchanged fields as context and changes as - and + pairs', () => {
    const lines = diffLines(byId('p3'))
    expect(lines.map((l) => `${l.kind}:${l.field}`)).toEqual([
      'context:name',
      'removed:price',
      'added:price',
      'removed:stock',
      'added:stock',
      'removed:status',
      'added:status',
      'context:category',
    ])
    expect(lines[2]).toMatchObject({ value: '$699', moved: '+7.7%' })
  })

  it('shows a new product as all + and a removed one as all -', () => {
    expect(diffLines(byId('p9')).every((l) => l.kind === 'added')).toBe(true)
    expect(diffLines(byId('p11')).every((l) => l.kind === 'removed')).toBe(true)
  })
})
