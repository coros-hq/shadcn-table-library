import { describe, expect, it } from 'vitest'
import { parseCsv } from '#/components/csv-import/csv'
import {
  assign,
  autoMap,
  inView,
  missingRequired,
  review,
  toRecords,
} from '#/components/csv-import/review'
import { sampleCsv } from '#/components/csv-import/sample'

const csv = parseCsv(sampleCsv)
const mapping = autoMap(csv.headers)
const none = new Set<string>()
const byLine = (rows: ReturnType<typeof review>, line: number) =>
  rows.find((r) => r.line === line)!

describe('parseCsv', () => {
  it('handles a BOM, quotes, doubled quotes, CRLF and semicolons', () => {
    const data = parseCsv('\uFEFFa;b\r\n"x;y";"say ""hi"""\r\n\r\nz\r\n')
    expect(data.headers).toEqual(['a', 'b'])
    expect(data.rows).toEqual([
      ['x;y', 'say "hi"'],
      ['z', ''],
    ])
  })

  it('explains files it cannot read', () => {
    expect(() => parseCsv('only,a,header')).toThrow('header row')
    expect(() => parseCsv('a\n"open')).toThrow('never closed')
  })
})

describe('mapping', () => {
  it('matches headers by alias and leaves the rest unmapped', () => {
    expect(mapping).toEqual([
      'name',
      'email',
      'company',
      'country',
      'plan',
      'seats',
      null,
    ])
  })

  it('moves a field instead of mapping it twice', () => {
    const next = assign(mapping, 6, 'email')
    expect(next[1]).toBeNull()
    expect(next[6]).toBe('email')
    expect(missingRequired(next)).toEqual([])
    expect(missingRequired(assign(mapping, 4, null)).map((f) => f.id)).toEqual([
      'plan',
    ])
  })
})

describe('review', () => {
  const rows = review(csv, mapping, none)

  it('flags invalid cells by column with a message', () => {
    expect(byLine(rows, 5).issues[0]?.message).toBe('Name is required')
    expect(byLine(rows, 7).issues[3]?.message).toMatch(/2-letter/)
    expect(byLine(rows, 8).issues[1]?.message).toBe('Not a valid email address')
    expect(byLine(rows, 9).issues[4]?.message).toMatch(
      /Free, Pro or Enterprise/,
    )
    expect(byLine(rows, 10).issues[5]).toBeDefined()
    expect(byLine(rows, 13).issues[5]).toBeDefined()
    // Case doesn't matter for plans, and "1,200" is a number
    expect(byLine(rows, 4).status).toBe('ready')
    expect(byLine(rows, 12).status).toBe('ready')
  })

  it('flags duplicates in the file and existing customers', () => {
    expect(byLine(rows, 11)).toMatchObject({
      status: 'duplicate',
      issues: { 1: { message: 'Same email as line 2' } },
    })
    expect(byLine(rows, 6).issues[1]?.message).toMatch(/Already a customer/)
  })

  it('frees the email when the first copy is skipped', () => {
    const skipped = review(csv, mapping, new Set([byLine(rows, 2).id]))
    expect(byLine(skipped, 2).status).toBe('skipped')
    expect(byLine(skipped, 11).status).toBe('ready')
  })

  it('stops validating a column once it is no longer imported', () => {
    const unmapped = review(csv, assign(mapping, 3, null), none)
    expect(byLine(unmapped, 7).status).toBe('ready')
  })

  it('groups statuses into views', () => {
    expect(rows.filter((r) => inView(r.status, 'attention'))).toHaveLength(8)
    expect(rows.filter((r) => inView(r.status, 'ready'))).toHaveLength(6)
  })
})

describe('toRecords', () => {
  it('imports ready rows only, normalized', () => {
    const records = toRecords(review(csv, mapping, none), mapping)
    expect(records).toHaveLength(6)
    expect(records.find((r) => r.name === 'Katherine Johnson')).toEqual({
      name: 'Katherine Johnson',
      email: 'katherine@nasa.gov',
      company: 'NASA',
      country: 'US',
      plan: 'Pro',
      seats: 40,
    })
    expect(records.find((r) => r.name === 'Barbara Liskov')?.seats).toBe(1200)
    expect(records.find((r) => r.name === 'Radia Perlman')?.company).toBeNull()
  })
})
