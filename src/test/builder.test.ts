import ts from 'typescript'
import { describe, expect, it } from 'vitest'
import { generate, installCommand } from '#/components/builder/generate'
import { applyRules, operators } from '#/components/builder/filters'
import type { Field, FilterRule } from '#/components/builder/filters'
import {
  addColumn,
  buildRows,
  changeColumnType,
  columnTypes,
  decodeState,
  defaultState,
  encodeState,
  featureBlocks,
  makeId,
  moveColumn,
  removeColumn,
  renameColumn,
  setColumnOptions,
} from '#/components/builder/schema'
import type { BuilderState, ColumnSpec } from '#/components/builder/schema'

const allFeatures = featureBlocks.map((f) => f.id)

const everyType: ColumnSpec[] = [
  { id: 'title', name: 'Owner\'s "title"', type: 'text' },
  { id: 'amount', name: 'Amount', type: 'number' },
  {
    id: 'stage',
    name: 'Stage',
    type: 'select',
    options: ['Open', "Won't fix"],
  },
  { id: 'due', name: 'Due', type: 'date' },
  { id: 'done', name: 'Done', type: 'checkbox' },
]

describe('makeId', () => {
  it('produces a unique JS identifier and never claims the row key', () => {
    expect(makeId('Due date', [])).toBe('due_date')
    expect(makeId('Due date', ['due_date'])).toBe('due_date_2')
    expect(makeId('Id', [])).toBe('id_2')
    expect(makeId('2024 revenue', [])).toBe('col_2024_revenue')
    expect(makeId('!!!', [])).toBe('col')
    expect(makeId('Prix (€)', [])).toBe('prix')
  })
})

describe('editing', () => {
  const withRule: BuilderState = {
    ...defaultState,
    filters: [
      { fieldId: 'budget', op: 'gt', value: '10' },
      { fieldId: 'status', op: 'is', value: 'Done' },
    ],
  }

  it('renames without changing the id the generated code depends on', () => {
    const next = renameColumn(withRule, 'budget', 'Spend')
    expect(next.columns.find((c) => c.id === 'budget')?.name).toBe('Spend')
    expect(next.filters).toHaveLength(2)
  })

  it('drops rules for a removed column', () => {
    expect(
      removeColumn(withRule, 'budget').filters.map((r) => r.fieldId),
    ).toEqual(['status'])
  })

  it('drops rules that no longer fit after a type change', () => {
    const next = changeColumnType(withRule, 'budget', 'checkbox')
    expect(next.filters.map((r) => r.fieldId)).toEqual(['status'])
    expect(changeColumnType(withRule, 'status', 'text').filters).toHaveLength(1)
  })

  it('gives a column the default options when it becomes a select', () => {
    const next = changeColumnType(defaultState, 'name', 'select')
    expect(next.columns[0].options).toEqual([
      'Option 1',
      'Option 2',
      'Option 3',
    ])
    expect(
      changeColumnType(next, 'name', 'text').columns[0].options,
    ).toBeUndefined()
  })

  it('drops a select rule whose option was deleted', () => {
    const next = setColumnOptions(withRule, 'status', ['Todo', 'Blocked'])
    expect(next.filters.map((r) => r.fieldId)).toEqual(['budget'])
  })

  it('adds uniquely named columns up to the cap', () => {
    let state = defaultState
    for (let i = 0; i < 30; i++) state = addColumn(state)
    expect(state.columns).toHaveLength(20)
    const ids = state.columns.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('moves columns and ignores moves past either end', () => {
    expect(moveColumn(defaultState, 'name', -1)).toBe(defaultState)
    expect(moveColumn(defaultState, 'name', 1).columns[1].id).toBe('name')
  })
})

describe('URL state', () => {
  it('round-trips, including unicode names and rules', () => {
    const state: BuilderState = {
      columns: [
        { id: 'prix', name: 'Prix (€) — 日本語', type: 'number' },
        ...everyType.slice(2, 3),
      ],
      features: ['search', 'filters'],
      filters: [{ fieldId: 'prix', op: 'gte', value: '5' }],
    }
    expect(decodeState(encodeState(state))).toEqual(state)
    expect(decodeState(encodeState(defaultState))).toEqual(defaultState)
  })

  it('stays a short, URL-safe token', () => {
    const encoded = encodeState(defaultState)
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(encoded.length).toBeLessThan(400)
  })

  it.each([undefined, '', 'not base64!!', 'e30', btoa('[1,2]'), btoa('null')])(
    'falls back to the default table for %j',
    (value) => {
      expect(decodeState(value)).toEqual(defaultState)
    },
  )

  it('drops invalid columns, features and rules instead of failing', () => {
    const bad = btoa(
      JSON.stringify({
        c: [
          ['ok', 'Fine', 'text'],
          ['ok', 'Duplicate id', 'text'],
          ['id', 'Reserved', 'text'],
          ['Bad Id', 'Bad', 'text'],
          ['t', 'Unknown type', 'rocket'],
          ['pick', 'Pick', 'select', []],
        ],
        f: ['search', 'nonsense'],
        r: [
          ['ok', 'contains', 'x'],
          ['ok', 'gt', '5'],
          ['ghost', 'contains', 'x'],
          ['ok', 'contains'],
        ],
      }),
    )
    const state = decodeState(bad)
    expect(state.columns.map((c) => c.id)).toEqual(['ok', 'pick'])
    expect(state.columns[1].options).toEqual([
      'Option 1',
      'Option 2',
      'Option 3',
    ])
    expect(state.features).toEqual(['search'])
    expect(state.filters).toEqual([
      { fieldId: 'ok', op: 'contains', value: 'x' },
    ])
  })
})

describe('buildRows', () => {
  it('is deterministic and respects each column type', () => {
    const rows = buildRows(everyType)
    expect(buildRows(everyType)).toEqual(rows)
    expect(rows).toHaveLength(12)
    for (const row of rows) {
      expect(typeof row.title).toBe('string')
      expect(typeof row.amount).toBe('number')
      expect(['Open', "Won't fix"]).toContain(row.stage)
      expect(row.due).toMatch(/^2025-\d{2}-\d{2}$/)
      expect(typeof row.done).toBe('boolean')
    }
  })
})

describe('applyRules', () => {
  const fields: Field[] = [
    { id: 'name', name: 'Name', type: 'text' },
    { id: 'n', name: 'N', type: 'number' },
    { id: 's', name: 'S', type: 'select', options: ['a', 'b'] },
    { id: 'd', name: 'D', type: 'date' },
    { id: 'c', name: 'C', type: 'checkbox' },
  ]
  const rows = [
    { id: '1', name: 'Alpha', n: 1, s: 'a', d: '2025-01-01', c: true },
    { id: '2', name: 'beta', n: 5, s: 'b', d: '2025-06-01', c: false },
    { id: '3', name: '', n: 9, s: 'a', d: '2025-12-31', c: false },
  ]
  const ids = (rules: FilterRule[]) =>
    applyRules(rows, fields, rules).map((r) => r.id)
  const rule = (
    fieldId: string,
    op: FilterRule['op'],
    value = '',
  ): FilterRule => ({
    fieldId,
    op,
    value,
  })

  it.each([
    [rule('name', 'contains', 'ALP'), ['1']],
    [rule('name', 'notContains', 'a'), ['3']],
    [rule('name', 'is', 'BETA'), ['2']],
    [rule('name', 'isEmpty'), ['3']],
    [rule('name', 'isNotEmpty'), ['1', '2']],
    [rule('n', 'eq', '5'), ['2']],
    [rule('n', 'neq', '5'), ['1', '3']],
    [rule('n', 'gt', '1'), ['2', '3']],
    [rule('n', 'gte', '5'), ['2', '3']],
    [rule('n', 'lt', '5'), ['1']],
    [rule('n', 'lte', '5'), ['1', '2']],
    [rule('s', 'is', 'a'), ['1', '3']],
    [rule('s', 'isNot', 'a'), ['2']],
    [rule('d', 'before', '2025-06-01'), ['1']],
    [rule('d', 'after', '2025-06-01'), ['3']],
    [rule('d', 'on', '2025-06-01'), ['2']],
    [rule('c', 'checked'), ['1']],
    [rule('c', 'unchecked'), ['2', '3']],
  ])('%j keeps %j', (r, expected) => {
    expect(ids([r])).toEqual(expected)
  })

  it('combines rules with AND', () => {
    expect(ids([rule('s', 'is', 'a'), rule('n', 'gt', '1')])).toEqual(['3'])
  })

  it('ignores rules that are not finished or point at nothing', () => {
    expect(ids([rule('name', 'contains', '')])).toEqual(['1', '2', '3'])
    expect(ids([rule('n', 'gt', 'abc')])).toEqual(['1', '2', '3'])
    expect(ids([rule('ghost', 'contains', 'x')])).toEqual(['1', '2', '3'])
  })

  it('has an operator list for every column type', () => {
    for (const { value } of columnTypes) {
      expect(operators[value].length).toBeGreaterThan(0)
    }
  })
})

function syntaxErrors(path: string, code: string) {
  const out = ts.transpileModule(code, {
    fileName: path,
    reportDiagnostics: true,
    compilerOptions: {
      jsx: ts.JsxEmit.Preserve,
      target: ts.ScriptTarget.ESNext,
    },
  })
  return (out.diagnostics ?? []).map((d) =>
    ts.flattenDiagnosticMessageText(d.messageText, '\n'),
  )
}

describe('generate', () => {
  const states: [string, BuilderState][] = [
    ['default', defaultState],
    [
      'every type, every feature, with filters',
      {
        columns: everyType,
        features: allFeatures,
        filters: [
          { fieldId: 'stage', op: 'is', value: "Won't fix" },
          { fieldId: 'amount', op: 'gt', value: '100' },
        ],
      },
    ],
    ['no columns', { columns: [], features: allFeatures, filters: [] }],
    ['no features', { columns: everyType, features: [], filters: [] }],
    ...allFeatures.map((feature): [string, BuilderState] => [
      `only ${feature}`,
      { columns: everyType, features: [feature], filters: [] },
    ]),
  ]

  it.each(states)('emits valid TypeScript for %s', (_name, state) => {
    for (const file of generate(state)) {
      expect(syntaxErrors(file.path, file.code), file.path).toEqual([])
    }
  })

  it('writes names, quotes and default filters into the code', () => {
    const files = generate(states[1][1])
    const columns = files.find((f) => f.path.endsWith('columns.tsx'))!.code
    expect(columns).toContain(`header: 'Owner\\'s "title"'`)
    expect(columns).toContain(`options: ['Open', 'Won\\'t fix']`)
    expect(columns).toContain('dateFormat')
    const index = files.find((f) => f.path.endsWith('index.tsx'))!.code
    expect(index).toContain(
      `{ fieldId: 'stage', op: 'is', value: 'Won\\'t fix' },`,
    )
    expect(files.map((f) => f.path.split('/').pop())).toEqual(
      expect.arrayContaining(['filters.ts', 'filter-bar.tsx', 'data.ts']),
    )
  })

  it('ships the filter files only when filters are on', () => {
    const names = (state: BuilderState) =>
      generate(state).map((f) => f.path.split('/').pop())
    expect(names(states[3][1])).not.toContain('filter-bar.tsx')
    expect(names({ ...defaultState, columns: [] })).not.toContain('filters.ts')
  })

  it('asks the shadcn CLI only for what the code imports', () => {
    expect(installCommand({ columns: [], features: [], filters: [] })).toBe(
      'npx shadcn@latest add table',
    )
    expect(installCommand(states[1][1])).toBe(
      'npx shadcn@latest add table button input checkbox popover select badge',
    )
  })
})
