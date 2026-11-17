import ts from 'typescript'
import { describe, expect, it } from 'vitest'
import { generate, registryItem } from '#/components/builder/generate'
import {
  ImportError,
  MAX_EMBEDDED_ROWS,
  MAX_IMPORT_ROWS,
  coerceRows,
  inferImport,
  inferType,
  matchesData,
  parseCsv,
  parseInput,
  parseJson,
  withDataOptions,
} from '#/components/builder/import'
import {
  MAX_COLUMNS,
  changeColumnType,
  decodeState,
  defaultState,
  encodeState,
  featureBlocks,
  replaceColumns,
} from '#/components/builder/schema'

const importText = (text: string) => inferImport(parseInput(text), 'test')

const CUSTOMERS = `name,email,plan,seats,renews,active
Ada Lovelace,ada@example.com,Pro,12,2025-09-01,yes
Alan Turing,alan@example.com,Free,1,2025-03-15,no
Grace Hopper,grace@example.com,Pro,"1,250",2025-01-20,yes
Edsger Dijkstra,edsger@example.com,Free,,2025-11-02,no
Barbara Liskov,barbara@example.com,Pro,4,2025-06-30,yes`

describe('parseCsv', () => {
  it('handles quotes, doubled quotes, newlines inside quotes and CRLF', () => {
    const table = parseCsv(
      '\uFEFFname,note\r\n"Smith, J","said ""hi""\nthen left"\r\nBo,\r\n',
    )
    expect(table.headers).toEqual(['name', 'note'])
    expect(table.rows).toEqual([
      ['Smith, J', 'said "hi"\nthen left'],
      ['Bo', ''],
    ])
  })

  it('detects semicolons and tabs, skips blank lines, pads short rows', () => {
    expect(parseCsv('a;b\n1;2\n\n3').rows).toEqual([
      ['1', '2'],
      ['3', ''],
    ])
    expect(parseCsv('a\tb\n1\t2').rows).toEqual([['1', '2']])
  })

  it('explains what is wrong', () => {
    expect(() => parseCsv('a,b')).toThrow(ImportError)
    expect(() => parseCsv('a,b\n"open,2')).toThrow('never closed')
  })
})

describe('parseJson', () => {
  it('reads an array, or the array inside an API response', () => {
    const rows = [{ a: 1 }, { b: 'x', a: 2 }]
    expect(parseJson(JSON.stringify(rows))).toEqual({
      headers: ['a', 'b'],
      rows: [
        [1, null],
        [2, 'x'],
      ],
    })
    expect(parseJson(JSON.stringify({ total: 2, data: rows })).headers).toEqual(
      ['a', 'b'],
    )
  })

  it('keeps nested values as JSON text', () => {
    expect(parseJson('[{"tags":["a","b"],"meta":{"x":1}}]').rows[0]).toEqual([
      '["a","b"]',
      '{"x":1}',
    ])
  })

  it('rejects invalid JSON and JSON without records', () => {
    expect(() => parseJson('{oops')).toThrow("isn't valid JSON")
    expect(() => parseJson('[1, 2]')).toThrow('array of objects')
    expect(() => parseJson('{"a": 1}')).toThrow('array of objects')
  })

  it('is picked for JSON-looking input, CSV otherwise', () => {
    expect(parseInput('  [{"a":1}]').headers).toEqual(['a'])
    expect(parseInput('a\n1').headers).toEqual(['a'])
    expect(() => parseInput('   ')).toThrow('Paste some data')
  })
})

describe('inferType', () => {
  it.each([
    [['yes', 'no', 'Y', ''], 'checkbox'],
    [[true, false, null], 'checkbox'],
    [['1', '0', '1'], 'number'],
    [['1,234', '-5.5', 12], 'number'],
    [['2025-01-02', '2025-03-04T10:00:00Z', ''], 'date'],
    [['Pro', 'Free', 'Pro', 'Free', 'Pro'], 'select'],
    [['Ada', 'Alan', 'Grace', 'Ada'], 'text'],
    [['12', 'twelve'], 'text'],
    [['03/04/2025', '05/06/2025'], 'text'],
    [['', null], 'text'],
  ])('%j is %s', (values, type) => {
    expect(inferType(values)).toBe(type)
  })
})

describe('inferImport', () => {
  it('turns a CSV into typed columns and records keyed by column id', () => {
    const { columns, data } = importText(CUSTOMERS)
    expect(columns.map((c) => [c.id, c.type])).toEqual([
      ['name', 'text'],
      ['email', 'text'],
      ['plan', 'select'],
      ['seats', 'number'],
      ['renews', 'date'],
      ['active', 'checkbox'],
    ])
    expect(columns[2].options).toEqual(['Pro', 'Free'])
    expect(data.records[0]).toMatchObject({ name: 'Ada Lovelace', seats: '12' })
    expect(data.truncatedRows).toBe(0)
  })

  it('names blank and repeated headers, and keeps ids valid', () => {
    const { columns } = importText('id,Name,,Name\n1,a,b,c')
    expect(columns.map((c) => c.name)).toEqual([
      'id',
      'Name',
      'Column 3',
      'Name 2',
    ])
    expect(columns.map((c) => c.id)).toEqual([
      'id_2',
      'name',
      'column_3',
      'name_2',
    ])
  })

  it('caps columns and rows, and says how much was left out', () => {
    const headers = Array.from({ length: MAX_COLUMNS + 3 }, (_, i) => `f${i}`)
    const body = Array.from({ length: MAX_IMPORT_ROWS + 7 }, () =>
      headers.map(() => '1').join(','),
    )
    const { columns, data } = importText(
      [headers.join(','), ...body].join('\n'),
    )
    expect(columns).toHaveLength(MAX_COLUMNS)
    expect(data.droppedFields).toBe(3)
    expect(data.records).toHaveLength(MAX_IMPORT_ROWS)
    expect(data.truncatedRows).toBe(7)
  })
})

describe('coerceRows', () => {
  const { columns, data } = importText(CUSTOMERS)
  const state = replaceColumns(defaultState, columns)

  it('types values by column, keeping empty numbers empty', () => {
    const rows = coerceRows(state.columns, data)
    expect(rows[0]).toEqual({
      id: '1',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      plan: 'Pro',
      seats: 12,
      renews: '2025-09-01',
      active: true,
    })
    expect(rows[2].seats).toBe(1250)
    expect(rows[3].seats).toBeNull()
  })

  it('re-reads the original values when a type is corrected', () => {
    const asText = changeColumnType(state, 'seats', 'text')
    expect(coerceRows(asText.columns, data)[2].seats).toBe('1,250')
    const asSelect = withDataOptions(
      state,
      changeColumnType(state, 'name', 'select'),
      data,
    )
    expect(asSelect.columns[0].options).toEqual([
      'Ada Lovelace',
      'Alan Turing',
      'Grace Hopper',
      'Edsger Dijkstra',
      'Barbara Liskov',
    ])
  })

  it('gives new columns empty values, and notices when the schema moved on', () => {
    const extra = replaceColumns(state, [
      ...state.columns,
      { id: 'notes', name: 'Notes', type: 'text' },
    ])
    expect(coerceRows(extra.columns, data)[0].notes).toBe('')
    expect(matchesData(state.columns, data)).toBe(true)
    expect(matchesData(defaultState.columns, data)).toBe(false)
  })
})

describe('privacy', () => {
  const { columns, data } = importText(CUSTOMERS)
  const state = replaceColumns(defaultState, columns)
  const rows = coerceRows(state.columns, data)

  it('keeps the records out of the share link and the registry item', () => {
    const link = JSON.stringify(decodeState(encodeState(state)))
    const registry = JSON.stringify(registryItem(state))
    for (const secret of ['Ada Lovelace', 'ada@example.com', '2025-09-01']) {
      expect(link).not.toContain(secret)
      expect(registry).not.toContain(secret)
    }
    // The schema itself (names, types, repeated select values) does travel
    expect(link).toContain('"Pro"')
  })

  it('writes the records only into the locally generated data.ts', () => {
    const files = generate(state, { rows })
    const data = files.find((f) => f.path.endsWith('data.ts'))!.code
    expect(data).toContain(`name: 'Ada Lovelace'`)
    expect(data).toContain('seats: number | null')
    expect(data).toContain('seats: null,')
    expect(data).toContain('Your imported rows')
    const cols = files.find((f) => f.path.endsWith('columns.tsx'))!.code
    expect(cols).toContain(`row.original.seats?.toLocaleString('en-US')`)
  })

  it('embeds only the first rows of a large import, and says so', () => {
    const many = Array.from({ length: MAX_EMBEDDED_ROWS + 10 }, (_, i) => ({
      ...rows[0],
      id: String(i + 1),
      seats: i,
    }))
    const data = generate(state, { rows: many }).find((f) =>
      f.path.endsWith('data.ts'),
    )!.code
    expect(data.match(/^ {2}\{$/gm)).toHaveLength(MAX_EMBEDDED_ROWS)
    expect(data).toContain(`The first ${MAX_EMBEDDED_ROWS} of your 60`)
    // No empty numbers in the embedded part, so no `| null`
    expect(data).toContain('seats: number\n')
  })

  it('generates valid TypeScript from imported data with every feature on', () => {
    const all = { ...state, features: featureBlocks.map((f) => f.id) }
    for (const file of generate(all, { rows })) {
      const out = ts.transpileModule(file.code, {
        fileName: file.path,
        reportDiagnostics: true,
        compilerOptions: { jsx: ts.JsxEmit.Preserve },
      })
      expect(out.diagnostics ?? [], file.path).toEqual([])
    }
  })
})
