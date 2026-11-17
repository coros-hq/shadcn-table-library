import ts from 'typescript'
import { describe, expect, it } from 'vitest'
import {
  generate,
  installCommand,
  registryCommand,
  registryItem,
} from '#/components/builder/generate'
import {
  applyFacets,
  applyRules,
  operators,
} from '#/components/builder/filters'
import { emptyFacet } from '#/components/builder/filters'
import { parse, validate } from '#/components/builder/editable-cell'
import type { EditField } from '#/components/builder/editable-cell'
import { toCsv, toExcelHtml } from '#/components/builder/export-menu'
import { templates } from '#/components/builder/templates'
import type {
  FacetDef,
  FacetValue,
  Field,
  FilterRule,
} from '#/components/builder/filters'
import {
  addColumn,
  addFacet,
  addPreset,
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
  removeFacet,
  removePreset,
  renameColumn,
  setColumnOptions,
  setColumnPin,
  setColumnReadOnly,
  setColumnRules,
  setExport,
  setFacetColumn,
  setFacetKind,
  toggleRowAction,
  updatePreset,
} from '#/components/builder/schema'
import type { BuilderState, ColumnSpec } from '#/components/builder/schema'

const allFeatures = featureBlocks.map((f) => f.id)

// Every new feature on, with rules, pins and a read-only column
const richState: BuilderState = {
  ...defaultState,
  columns: [
    {
      id: 'name',
      name: 'Name',
      type: 'text',
      pin: 'left',
      rules: { required: true, max: 20 },
    },
    { id: 'status', name: 'Status', type: 'select', options: ['A', "B's"] },
    {
      id: 'budget',
      name: 'Budget',
      type: 'number',
      align: 'right',
      rules: { min: 0, integer: true },
    },
    { id: 'due', name: 'Due', type: 'date', pin: 'right' },
    { id: 'done', name: 'Done', type: 'checkbox' },
    { id: 'note', name: 'Note', type: 'text', readOnly: true },
  ],
  features: featureBlocks.map((f) => f.id),
}

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
    facets: [
      { fieldId: 'budget', kind: 'range' },
      { fieldId: 'status', kind: 'options' },
    ],
    presets: [
      {
        id: 'p1',
        label: 'Big',
        rule: { fieldId: 'budget', op: 'gt', value: '10' },
      },
      {
        id: 'p2',
        label: 'Done',
        rule: { fieldId: 'status', op: 'is', value: 'Done' },
      },
    ],
  }
  const facetIds = (state: BuilderState) => state.facets.map((f) => f.fieldId)
  const presetIds = (state: BuilderState) => state.presets.map((p) => p.id)

  it('renames without changing the id the generated code depends on', () => {
    const next = renameColumn(withRule, 'budget', 'Spend')
    expect(next.columns.find((c) => c.id === 'budget')?.name).toBe('Spend')
    expect(next.facets).toHaveLength(2)
    expect(next.presets).toHaveLength(2)
  })

  it('drops filters for a removed column', () => {
    const next = removeColumn(withRule, 'budget')
    expect(facetIds(next)).toEqual(['status'])
    expect(presetIds(next)).toEqual(['p2'])
  })

  it('drops filters that no longer fit after a type change', () => {
    const next = changeColumnType(withRule, 'budget', 'checkbox')
    expect(facetIds(next)).toEqual(['status'])
    expect(presetIds(next)).toEqual(['p2'])
    const text = changeColumnType(withRule, 'status', 'text')
    expect(facetIds(text)).toEqual(['budget'])
    expect(presetIds(text)).toEqual(['p1'])
  })

  it('adds facets on unused columns only, with the type default kind', () => {
    let state: BuilderState = { ...defaultState, facets: [], presets: [] }
    state = addFacet(state)
    expect(state.facets).toEqual([{ fieldId: 'name', kind: 'text' }])
    state = setFacetKind(state, 0, 'options')
    expect(state.facets[0].kind).toBe('options')
    expect(setFacetKind(state, 0, 'range')).toBe(state)
    state = addFacet(state)
    expect(setFacetColumn(state, 1, 'name')).toBe(state)
    state = setFacetColumn(state, 1, 'budget')
    expect(state.facets[1]).toEqual({ fieldId: 'budget', kind: 'range' })
    for (let i = 0; i < 10; i++) state = addFacet(state)
    expect(state.facets).toHaveLength(defaultState.columns.length)
    expect(removeFacet(state, 0).facets).toHaveLength(
      defaultState.columns.length - 1,
    )
  })

  it('adds, edits and removes quick filters', () => {
    let state = addPreset({ ...defaultState, facets: [], presets: [] })
    expect(state.presets[0].rule).toEqual({
      fieldId: 'name',
      op: 'contains',
      value: '',
    })
    const id = state.presets[0].id
    state = updatePreset(state, id, { label: 'Mine' })
    expect(state.presets[0].label).toBe('Mine')
    expect(removePreset(state, id).presets).toEqual([])
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

  it('drops a select quick filter whose option was deleted', () => {
    const next = setColumnOptions(withRule, 'status', ['Todo', 'Blocked'])
    expect(presetIds(next)).toEqual(['p1'])
    expect(facetIds(next)).toEqual(['budget', 'status'])
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

describe('editing, pinning, actions and export settings', () => {
  it('keeps only the rules a type supports, and drops them on a type change', () => {
    let state = setColumnRules(defaultState, 'name', {
      required: true,
      min: 2.7,
      integer: true,
    })
    expect(state.columns[0].rules).toEqual({ required: true, min: 2 })
    state = setColumnRules(state, 'name', { min: -1, required: false })
    expect(state.columns[0].rules).toBeUndefined()
    state = setColumnRules(state, 'budget', { min: -5, integer: true })
    expect(state.columns[2].rules).toEqual({ min: -5, integer: true })
    expect(
      changeColumnType(state, 'budget', 'text').columns[2].rules,
    ).toBeUndefined()
    expect(
      setColumnRules(defaultState, 'done', { required: true }).columns[4],
    ).not.toHaveProperty('rules')
  })

  it('sets and clears read-only and pins', () => {
    let state = setColumnReadOnly(defaultState, 'name', true)
    state = setColumnPin(state, 'name', 'left')
    expect(state.columns[0]).toMatchObject({ readOnly: true, pin: 'left' })
    state = setColumnPin(
      setColumnReadOnly(state, 'name', false),
      'name',
      undefined,
    )
    expect(state.columns[0]).toEqual(defaultState.columns[0])
  })

  it('keeps row actions in menu order', () => {
    let state: BuilderState = { ...defaultState, actions: [] }
    state = toggleRowAction(state, 'delete')
    state = toggleRowAction(state, 'copy')
    expect(state.actions).toEqual(['copy', 'delete'])
    expect(toggleRowAction(state, 'copy').actions).toEqual(['delete'])
  })

  it('never leaves export without a format, and cleans the file name', () => {
    const one = setExport(defaultState, { formats: ['excel'] })
    expect(one.exporting.formats).toEqual(['excel'])
    expect(setExport(one, { formats: [] })).toBe(one)
    expect(
      setExport(defaultState, { filename: 'q3/<report>' }).exporting.filename,
    ).toBe('q3report')
  })

  it('round-trips column settings through the URL', () => {
    expect(decodeState(encodeState(richState))).toEqual(richState)
  })

  it('encodes a table without the new settings exactly as before', () => {
    // Links shared before these features existed must keep working, and a
    // table that doesn't use them keeps the same short link
    const old = { c: [['a', 'A', 'text']], f: ['search'], fs: [], ps: [] }
    const token = btoa(JSON.stringify(old))
      .replace(/=+$/, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
    const state = decodeState(token)
    expect(state.actions).toEqual(defaultState.actions)
    expect(state.exporting).toEqual(defaultState.exporting)
    expect(encodeState(state)).toBe(token)
  })

  it('ignores malformed column settings', () => {
    const bad = btoa(
      JSON.stringify({
        c: [
          ['a', 'A', 'text', [], 0, { ro: 'yes', p: 'top', mn: 'x', rq: 1 }],
          ['b', 'B', 'checkbox', [], 'left', { mn: 3, in: 1 }],
          ['c', 'C', 'number', [], 0, 'nope'],
        ],
        f: [],
        a: ['delete', 'launch', 'copy'],
        x: [['pdf'], 42],
      }),
    )
    const state = decodeState(bad)
    expect(state.columns[0]).toEqual({
      id: 'a',
      name: 'A',
      type: 'text',
      rules: { required: true },
    })
    expect(state.columns[1]).toEqual({
      id: 'b',
      name: 'B',
      type: 'checkbox',
      align: 'left',
    })
    expect(state.columns[2]).toEqual({ id: 'c', name: 'C', type: 'number' })
    expect(state.actions).toEqual(['copy', 'delete'])
    expect(state.exporting).toEqual(defaultState.exporting)
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
      facets: [{ fieldId: 'prix', kind: 'range' }],
      presets: [
        {
          id: 'p1',
          label: 'Dear',
          rule: { fieldId: 'prix', op: 'gte', value: '5' },
        },
      ],
      pager: { style: 'arrows', sizeSelect: true },
      states: {
        emptyTitle: 'Aucun résultat',
        emptyDescription: '',
        loadingStyle: 'spinner',
        loadingRows: 8,
        loadingMessage: 'Chargement…',
      },
      actions: ['delete'],
      exporting: { formats: ['excel'], filename: 'rapport' },
    }
    expect(decodeState(encodeState(state))).toEqual(state)
    expect(decodeState(encodeState(defaultState))).toEqual(defaultState)
  })

  it('ignores malformed state messages', () => {
    const bad = btoa(
      JSON.stringify({
        c: [],
        f: [],
        s: [1, 'x', 'bogus', 7, 'y'.repeat(500)],
      }),
    )
    const { states } = decodeState(bad)
    expect(states.emptyTitle).toBe(defaultState.states.emptyTitle)
    expect(states.emptyDescription).toBe('x')
    expect(states.loadingStyle).toBe('skeleton')
    expect(states.loadingRows).toBe(5)
    expect(states.loadingMessage).toHaveLength(120)
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

  it('drops invalid columns, features and filters instead of failing', () => {
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
        fs: [
          ['ok', 'options'],
          ['ok', 'text'],
          ['pick', 'range'],
          ['ghost', 'text'],
          ['pick', 'rocket'],
        ],
        ps: [
          ['a', 'Has x', 'ok', 'contains', 'x'],
          ['b', 'Numeric on text', 'ok', 'gt', '5'],
          ['c', 'Ghost', 'ghost', 'contains', 'x'],
          ['d', 'Short', 'ok', 'contains'],
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
    expect(state.facets).toEqual([{ fieldId: 'ok', kind: 'options' }])
    expect(state.presets).toEqual([
      {
        id: 'a',
        label: 'Has x',
        rule: { fieldId: 'ok', op: 'contains', value: 'x' },
      },
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
        facets: [
          { fieldId: 'stage', kind: 'options' },
          { fieldId: 'amount', kind: 'range' },
          { fieldId: 'title', kind: 'text' },
        ],
        presets: [
          {
            id: 'wontfix',
            label: "Won't fix",
            rule: { fieldId: 'stage', op: 'is', value: "Won't fix" },
          },
        ],
        pager: defaultState.pager,
        states: defaultState.states,
        actions: defaultState.actions,
        exporting: defaultState.exporting,
      },
    ],
    [
      'arrows pager with rows per page',
      {
        columns: everyType,
        features: allFeatures,
        facets: [],
        presets: [],
        pager: { style: 'arrows', sizeSelect: true },
        states: defaultState.states,
        actions: defaultState.actions,
        exporting: defaultState.exporting,
      },
    ],
    [
      'no columns',
      {
        columns: [],
        features: allFeatures,
        facets: [],
        presets: [],
        pager: defaultState.pager,
        states: defaultState.states,
        actions: defaultState.actions,
        exporting: defaultState.exporting,
      },
    ],
    [
      'no features',
      {
        columns: everyType,
        features: [],
        facets: [],
        presets: [],
        pager: defaultState.pager,
        states: defaultState.states,
        actions: defaultState.actions,
        exporting: defaultState.exporting,
      },
    ],
    [
      'spinner loading with blank empty message, aligned columns',
      {
        ...defaultState,
        columns: everyType.map((c) => ({ ...c, align: 'right' as const })),
        states: {
          ...defaultState.states,
          emptyTitle: '',
          emptyDescription: '',
          loadingStyle: 'spinner',
        },
      },
    ],
    [
      'aligned columns with skeleton loading',
      {
        ...defaultState,
        columns: everyType.map((c) => ({ ...c, align: 'center' as const })),
      },
    ],
    ['every new feature, with rules and pins', richState],
    [
      'new features without filters, spinner loading',
      {
        ...richState,
        features: allFeatures.filter((f) => f !== 'filters'),
        states: { ...richState.states, loadingStyle: 'spinner' },
      },
    ],
    [
      'pinning without alignment or sorting',
      {
        ...richState,
        columns: richState.columns.map(({ align: _a, ...c }) => c),
        features: ['pinning', 'editing', 'export', 'columnVisibility'],
      },
    ],
    ...allFeatures.map((feature): [string, BuilderState] => [
      `only ${feature}`,
      {
        columns: everyType,
        features: [feature],
        facets: [],
        presets: [],
        pager: defaultState.pager,
        states: defaultState.states,
        actions: defaultState.actions,
        exporting: defaultState.exporting,
      },
    ]),
  ]

  it.each(states)('emits valid TypeScript for %s', (_name, state) => {
    for (const file of generate(state)) {
      expect(syntaxErrors(file.path, file.code), file.path).toEqual([])
    }
  })

  it('writes names, quotes, facets and quick filters into the code', () => {
    const files = generate(states[1][1])
    const columns = files.find((f) => f.path.endsWith('columns.tsx'))!.code
    expect(columns).toContain(`header: 'Owner\\'s "title"'`)
    expect(columns).toContain(`options: ['Open', 'Won\\'t fix']`)
    expect(columns).toContain('dateFormat')
    expect(columns).toContain(`{ fieldId: 'stage', kind: 'options' },`)
    expect(columns).toContain(
      `rule: { fieldId: 'stage', op: 'is', value: 'Won\\'t fix' },`,
    )
    expect(files.map((f) => f.path.split('/').pop())).toEqual(
      expect.arrayContaining(['filters.ts', 'filter-bar.tsx', 'data.ts']),
    )
  })

  it('writes the empty and loading messages into the code', () => {
    const code = (state: BuilderState) =>
      generate(state).find((f) => f.path.endsWith('data-table.tsx'))!.code
    const custom = {
      ...defaultState,
      states: {
        ...defaultState.states,
        emptyTitle: "Nothing's here",
        emptyDescription: 'Add a row',
        loadingRows: 8,
        loadingMessage: 'Fetching',
      },
    }
    const skeleton = code(custom)
    expect(skeleton).toContain(`{'Nothing\\'s here'}`)
    expect(skeleton).toContain(`{'Add a row'}`)
    expect(skeleton).toContain('length: 8')
    expect(skeleton).toContain(`{'Fetching'}`)
    expect(skeleton).toContain('Skeleton')

    const spinner = code({
      ...custom,
      states: { ...custom.states, loadingStyle: 'spinner' },
    })
    expect(spinner).toContain('LoaderCircle')
    expect(spinner).not.toContain('Skeleton')
    expect(
      installCommand({
        ...custom,
        states: { ...custom.states, loadingStyle: 'spinner' },
      }),
    ).not.toContain('skeleton')
  })

  it('ships the filter files only when filters are on', () => {
    const names = (state: BuilderState) =>
      generate(state).map((f) => f.path.split('/').pop())
    expect(names(states[4][1])).not.toContain('filter-bar.tsx')
    expect(names({ ...defaultState, columns: [] })).not.toContain('filters.ts')
  })

  it('asks the shadcn CLI only for what the code imports', () => {
    expect(
      installCommand({
        columns: [],
        features: [],
        facets: [],
        presets: [],
        pager: defaultState.pager,
        states: defaultState.states,
        actions: defaultState.actions,
        exporting: defaultState.exporting,
      }),
    ).toBe('npx shadcn@latest add table skeleton')
    expect(installCommand(states[1][1])).toBe(
      'npx shadcn@latest add table button input checkbox popover dropdown-menu select badge skeleton',
    )
  })

  const files = (state: BuilderState) =>
    Object.fromEntries(
      generate(state).map((f) => [f.path.split('/').pop()!, f.code]),
    )

  it('ships each feature module only when its feature is on', () => {
    const extra = [
      'editable-cell.tsx',
      'row-actions.tsx',
      'column-controls.tsx',
      'export-menu.tsx',
    ]
    const plain = Object.keys(files(defaultState))
    for (const name of extra) expect(plain).not.toContain(name)
    expect(Object.keys(files(richState))).toEqual(expect.arrayContaining(extra))
    // Row actions with nothing in the menu add no column
    const empty = files({ ...richState, features: ['rowActions'], actions: [] })
    expect(empty).not.toHaveProperty(['row-actions.tsx'])
    expect(empty['columns.tsx']).not.toContain('RowActions')
  })

  it('writes validation rules, pins and actions into the code', () => {
    const code = files(richState)
    expect(code['columns.tsx']).toContain(
      `field={{ type: 'text', rules: { required: true, max: 20 } }}`,
    )
    expect(code['columns.tsx']).toContain(
      `field={{ type: 'number', rules: { min: 0, integer: true } }}`,
    )
    // A read-only column keeps its plain cell
    expect(code['columns.tsx']).toMatch(
      /accessorKey: 'note',\n\s+header: 'Note',\n\s+size: 180,\n\s+},/,
    )
    expect(code['columns.tsx']).toContain(
      `actions={['copy', 'duplicate', 'delete']}`,
    )
    expect(code['data-table.tsx']).toContain(
      `columnPinning: { left: ['select', 'name'], right: ['due', 'actions'] }`,
    )
    expect(code['data-table.tsx']).toContain('getRowId: (row) => row.id')
    expect(code['data-table.tsx']).toContain(`filename={'table-export'}`)
  })

  it('keeps rows in local state only when something changes them', () => {
    const copyOnly = files({
      ...richState,
      features: ['rowActions'],
      actions: ['copy'],
    })['data-table.tsx']
    expect(copyOnly).not.toContain('tableData')
    const readOnly = files({
      ...richState,
      features: ['editing'],
      columns: richState.columns.map((c) => ({ ...c, readOnly: true })),
    })
    expect(readOnly['data-table.tsx']).not.toContain('updateCell')
    expect(readOnly).not.toHaveProperty(['editable-cell.tsx'])
    const deletes = files({
      ...richState,
      features: ['rowActions'],
      actions: ['delete'],
    })['data-table.tsx']
    expect(deletes).toContain('deleteRow')
    expect(deletes).not.toContain('duplicateRow')
    expect(deletes).not.toContain('updateCell')
  })

  it.each(templates.map((t) => [t.id, t.state] as const))(
    'template %s survives the URL and generates valid code',
    (_id, state) => {
      expect(decodeState(encodeState(state))).toEqual(state)
      for (const file of generate(state)) {
        expect(syntaxErrors(file.path, file.code), file.path).toEqual([])
      }
    },
  )
})

describe('validate', () => {
  const v = (raw: string, field: EditField) => validate(raw, field)

  it('checks numbers, whole numbers and bounds', () => {
    const field: EditField = {
      type: 'number',
      rules: { min: 0, max: 10, integer: true },
    }
    expect(v('5', field)).toBeNull()
    expect(v('', field)).toBe('Enter a number')
    expect(v('abc', field)).toBe('Enter a number')
    expect(v('2.5', field)).toBe('Enter a whole number')
    expect(v('-1', field)).toBe('Must be 0 or more')
    expect(v('11', field)).toBe('Must be 10 or less')
    expect(v('2.5', { type: 'number' })).toBeNull()
  })

  it('checks required text and its length, ignoring outer spaces', () => {
    const field: EditField = {
      type: 'text',
      rules: { required: true, min: 2, max: 4 },
    }
    expect(v('   ', field)).toBe('Required')
    expect(v(' a ', field)).toBe('At least 2 characters')
    expect(v('abcde', field)).toBe('At most 4 characters')
    expect(v(' abc ', field)).toBeNull()
    expect(v('', { type: 'text', rules: { min: 2 } })).toBeNull()
  })

  it('checks dates', () => {
    expect(v('', { type: 'date' })).toBeNull()
    expect(v('', { type: 'date', rules: { required: true } })).toBe('Required')
    expect(v('2025-13-45', { type: 'date' })).toBe('Enter a valid date')
    expect(v('2025-02-03', { type: 'date' })).toBeNull()
  })

  it('stores numbers as numbers and trims text', () => {
    expect(parse(' 42 ', { type: 'number' })).toBe(42)
    expect(parse(' hi ', { type: 'text' })).toBe('hi')
  })
})

describe('export files', () => {
  it('quotes CSV cells and defuses spreadsheet formulas', () => {
    expect(
      toCsv(
        ['Name', 'N'],
        [
          ['a,b', 1],
          ['say "hi"', -2],
          ['=SUM(A1)', 0],
        ],
      ),
    ).toBe(['Name,N', '"a,b",1', '"say ""hi""",-2', "'=SUM(A1),0"].join('\r\n'))
    expect(toCsv(['Done'], [[true], [false], [null]])).toBe(
      ['Done', 'Yes', 'No', ''].join('\r\n'),
    )
  })

  it('escapes HTML in the Excel table', () => {
    const out = toExcelHtml(['<b>'], [['<script>&']])
    expect(out).toContain('<th>&lt;b&gt;</th>')
    expect(out).toContain('<td>&lt;script&gt;&amp;</td>')
  })
})

describe('applyFacets', () => {
  const rows = buildRows(everyType)
  const ids = (facets: FacetDef[], values: Record<string, FacetValue>) =>
    applyFacets(rows, facets, values).map((r) => r.id)
  const value = (patch: Partial<FacetValue>): FacetValue => ({
    ...emptyFacet,
    ...patch,
  })

  it('returns every row until a facet is filled in', () => {
    const facets: FacetDef[] = [{ fieldId: 'stage', kind: 'options' }]
    expect(ids(facets, {})).toHaveLength(rows.length)
    expect(ids(facets, { stage: value({}) })).toHaveLength(rows.length)
  })

  it('matches any chosen option, and ANDs facets together', () => {
    const open = rows.filter((r) => r.stage === 'Open').map((r) => r.id)
    const facets: FacetDef[] = [{ fieldId: 'stage', kind: 'options' }]
    expect(ids(facets, { stage: value({ values: ['Open'] }) })).toEqual(open)
    expect(
      ids(facets, { stage: value({ values: ['Open', "Won't fix"] }) }),
    ).toHaveLength(rows.length)
    const both: FacetDef[] = [...facets, { fieldId: 'done', kind: 'boolean' }]
    const done = rows.filter((r) => r.stage === 'Open' && r.done === true)
    expect(
      ids(both, {
        stage: value({ values: ['Open'] }),
        done: value({ values: ['yes'] }),
      }),
    ).toEqual(done.map((r) => r.id))
  })

  it('filters ranges inclusively and ignores a half-typed bound', () => {
    const facets: FacetDef[] = [{ fieldId: 'amount', kind: 'range' }]
    const inRange = rows.filter((r) => (r.amount as number) >= 5000)
    expect(ids(facets, { amount: value({ min: '5000' }) })).toEqual(
      inRange.map((r) => r.id),
    )
    expect(ids(facets, { amount: value({ min: '-' }) })).toHaveLength(
      rows.length,
    )
  })

  it('filters date ranges and text', () => {
    const dates: FacetDef[] = [{ fieldId: 'due', kind: 'dateRange' }]
    const after = rows.filter((r) => (r.due as string) >= '2025-07-01')
    expect(ids(dates, { due: value({ min: '2025-07-01' }) })).toEqual(
      after.map((r) => r.id),
    )
    const text: FacetDef[] = [{ fieldId: 'title', kind: 'text' }]
    const hits = rows.filter((r) => String(r.title).includes('app'))
    expect(ids(text, { title: value({ text: ' APP ' }) })).toEqual(
      hits.map((r) => r.id),
    )
  })
})

describe('registry item', () => {
  it('describes every generated file and what it needs', () => {
    const item = registryItem(defaultState)
    expect(item.files.map((f) => f.target)).toEqual(
      generate(defaultState).map(
        (f) => `@components/tables/my-table/${f.path.split('/').pop()}`,
      ),
    )
    expect(item.registryDependencies).toEqual(
      expect.arrayContaining(['table', 'popover', 'checkbox']),
    )
  })

  it('points the CLI at the URL that carries the table', () => {
    const t = encodeState(defaultState)
    expect(registryCommand(t)).toBe(
      `npx shadcn@latest add 'https://www.shad-table.dev/r/builder.json?t=${t}'`,
    )
  })
})
