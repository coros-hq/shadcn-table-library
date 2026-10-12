import { needsValue, operators } from './filters'
import type { Field, FieldType, FilterRule } from './filters'

export type ColumnType = FieldType

export interface ColumnSpec extends Field {
  type: ColumnType
}

export type FeatureId =
  'search' | 'sorting' | 'pagination' | 'selection' | 'filters'

export interface BuilderState {
  columns: ColumnSpec[]
  features: FeatureId[]
  filters: FilterRule[]
}

export const MAX_COLUMNS = 20
export const MAX_NAME_LENGTH = 40
const MAX_OPTIONS = 12

export const columnTypes: { value: ColumnType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'select', label: 'Select' },
  { value: 'date', label: 'Date' },
  { value: 'checkbox', label: 'Checkbox' },
]

export const featureBlocks: {
  id: FeatureId
  label: string
  hint: string
}[] = [
  { id: 'search', label: 'Search', hint: 'Global text filter' },
  { id: 'filters', label: 'Filters', hint: 'Notion-style filter rules' },
  { id: 'sorting', label: 'Sorting', hint: 'Click a header to sort' },
  { id: 'pagination', label: 'Pagination', hint: '5 rows per page' },
  { id: 'selection', label: 'Row selection', hint: 'Checkbox column' },
]

const featureIds = featureBlocks.map((f) => f.id)
const typeIds = columnTypes.map((t) => t.value)

export const defaultState: BuilderState = {
  columns: [
    { id: 'name', name: 'Name', type: 'text' },
    {
      id: 'status',
      name: 'Status',
      type: 'select',
      options: ['Todo', 'In progress', 'Done'],
    },
    { id: 'budget', name: 'Budget', type: 'number' },
    { id: 'due', name: 'Due date', type: 'date' },
    { id: 'done', name: 'Done', type: 'checkbox' },
  ],
  features: ['search', 'filters', 'sorting', 'pagination'],
  filters: [],
}

const defaultOptions = () => ['Option 1', 'Option 2', 'Option 3']

// ---------------------------------------------------------------------------
// Editing. Every function returns a new state and keeps the filter rules
// consistent with the columns, so callers never have to.
// ---------------------------------------------------------------------------

/**
 * A valid JS identifier, unique among `taken`. Generated code reads cells as
 * `row.original.<id>`, and `id` is reserved for the row key.
 */
export function makeId(name: string, taken: string[]) {
  let base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
  if (base === '' || /^\d/.test(base)) base = `col_${base}`.replace(/_$/, '')
  const used = new Set([...taken, 'id'])
  let id = base
  for (let n = 2; used.has(id); n++) id = `${base}_${n}`
  return id
}

function pruneRules(columns: ColumnSpec[], rules: FilterRule[]): FilterRule[] {
  return rules.filter((rule) => {
    const column = columns.find((c) => c.id === rule.fieldId)
    if (!column) return false
    if (!operators[column.type].some((o) => o.op === rule.op)) return false
    return !(
      column.type === 'select' &&
      needsValue(column.type, rule.op) &&
      rule.value !== '' &&
      !(column.options ?? []).includes(rule.value)
    )
  })
}

function withColumns(state: BuilderState, columns: ColumnSpec[]) {
  return { ...state, columns, filters: pruneRules(columns, state.filters) }
}

export function addColumn(state: BuilderState): BuilderState {
  if (state.columns.length >= MAX_COLUMNS) return state
  let n = state.columns.length + 1
  const names = new Set(state.columns.map((c) => c.name))
  while (names.has(`Column ${n}`)) n++
  const name = `Column ${n}`
  const column: ColumnSpec = {
    id: makeId(
      name,
      state.columns.map((c) => c.id),
    ),
    name,
    type: 'text',
  }
  return withColumns(state, [...state.columns, column])
}

export function renameColumn(
  state: BuilderState,
  id: string,
  name: string,
): BuilderState {
  return withColumns(
    state,
    state.columns.map((c) =>
      c.id === id ? { ...c, name: name.slice(0, MAX_NAME_LENGTH) } : c,
    ),
  )
}

export function changeColumnType(
  state: BuilderState,
  id: string,
  type: ColumnType,
): BuilderState {
  const current = state.columns.find((c) => c.id === id)
  if (!current || current.type === type) return state
  const columns = state.columns.map((c) => {
    if (c.id !== id) return c
    const { options: _dropped, ...rest } = c
    return type === 'select'
      ? { ...rest, type, options: defaultOptions() }
      : { ...rest, type }
  })
  // A rule written for one type means nothing for another, even when the
  // operator name happens to exist in both ("is" for text and select).
  return withColumns(
    { ...state, filters: state.filters.filter((r) => r.fieldId !== id) },
    columns,
  )
}

export function setColumnOptions(
  state: BuilderState,
  id: string,
  options: string[],
): BuilderState {
  const cleaned = [...new Set(options.map((o) => o.trim()).filter(Boolean))]
  return withColumns(
    state,
    state.columns.map((c) =>
      c.id === id && c.type === 'select'
        ? { ...c, options: cleaned.slice(0, MAX_OPTIONS) }
        : c,
    ),
  )
}

export function removeColumn(state: BuilderState, id: string): BuilderState {
  return withColumns(
    state,
    state.columns.filter((c) => c.id !== id),
  )
}

export function moveColumn(
  state: BuilderState,
  id: string,
  direction: -1 | 1,
): BuilderState {
  const from = state.columns.findIndex((c) => c.id === id)
  const to = from + direction
  if (from < 0 || to < 0 || to >= state.columns.length) return state
  const columns = [...state.columns]
  ;[columns[from], columns[to]] = [columns[to], columns[from]]
  return withColumns(state, columns)
}

// ---------------------------------------------------------------------------
// URL state. One base64url JSON blob keeps the link a single short param.
// ---------------------------------------------------------------------------

type Compact = {
  c: [string, string, string, string[]?][]
  f: string[]
  r: [string, string, string][]
}

function toBase64Url(text: string) {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(value: string) {
  const binary = atob(value.replace(/-/g, '+').replace(/_/g, '/'))
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function encodeState(state: BuilderState): string {
  const compact: Compact = {
    c: state.columns.map((c) =>
      c.type === 'select'
        ? [c.id, c.name, c.type, c.options ?? []]
        : [c.id, c.name, c.type],
    ),
    f: state.features,
    r: state.filters.map((r) => [r.fieldId, r.op, r.value]),
  }
  return toBase64Url(JSON.stringify(compact))
}

const isString = (value: unknown): value is string => typeof value === 'string'

/** Anything malformed falls back to the default table rather than throwing. */
export function decodeState(value: string | undefined): BuilderState {
  if (!value) return defaultState
  try {
    // Untrusted input: nothing below assumes a shape until it is checked
    const raw = JSON.parse(fromBase64Url(value)) as {
      c?: unknown
      f?: unknown
      r?: unknown
    }
    if (
      !Array.isArray(raw.c) ||
      !Array.isArray(raw.f) ||
      !Array.isArray(raw.r)
    ) {
      return defaultState
    }

    const columns: ColumnSpec[] = []
    for (const entry of raw.c.slice(0, MAX_COLUMNS)) {
      if (!Array.isArray(entry)) continue
      const [id, name, type, options] = entry as unknown[]
      if (!isString(id) || !/^[a-z_][a-z0-9_]*$/.test(id) || id === 'id')
        continue
      if (columns.some((c) => c.id === id)) continue
      if (!isString(type) || !typeIds.includes(type as ColumnType)) continue
      const column: ColumnSpec = {
        id,
        name: (isString(name) && name.trim() ? name : id).slice(
          0,
          MAX_NAME_LENGTH,
        ),
        type: type as ColumnType,
      }
      if (column.type === 'select') {
        const list = Array.isArray(options) ? options.filter(isString) : []
        column.options = list.length
          ? list.slice(0, MAX_OPTIONS)
          : defaultOptions()
      }
      columns.push(column)
    }

    const features = featureIds.filter((id) =>
      (raw.f as unknown[]).includes(id),
    )
    const rules = (raw.r as unknown[]).flatMap((entry) =>
      Array.isArray(entry) && entry.length === 3 && entry.every(isString)
        ? [{ fieldId: entry[0], op: entry[1], value: entry[2].slice(0, 100) }]
        : [],
    ) as FilterRule[]

    return { columns, features, filters: pruneRules(columns, rules) }
  } catch {
    return defaultState
  }
}

// ---------------------------------------------------------------------------
// Sample data. Deterministic, so the preview, the generated data.ts and a
// server render all agree.
// ---------------------------------------------------------------------------

export type Row = Record<string, string | number | boolean>

const words = [
  'Website redesign',
  'Q3 campaign',
  'Onboarding flow',
  'Billing migration',
  'Mobile app',
  'Help center',
  'Pricing page',
  'Data pipeline',
  'Brand refresh',
  'Partner portal',
  'Search upgrade',
  'Accessibility audit',
]

const hash = (a: number, b: number) =>
  Math.imul((a + 1) * 2654435761 + (b + 1) * 40503, 2246822519) >>> 0

export function buildRows(columns: ColumnSpec[], count = 12): Row[] {
  return Array.from({ length: count }, (_, i) => {
    const row: Row = { id: String(i + 1) }
    columns.forEach((column, ci) => {
      const h = hash(i, ci)
      switch (column.type) {
        case 'text':
          row[column.id] = words[(i + ci * 5) % words.length]
          break
        case 'number':
          row[column.id] = 100 + (h % 9900)
          break
        case 'select': {
          const options = column.options ?? []
          row[column.id] = options.length ? options[h % options.length] : ''
          break
        }
        case 'date': {
          const day = new Date(Date.UTC(2025, 0, 1) + (h % 365) * 86_400_000)
          row[column.id] = day.toISOString().slice(0, 10)
          break
        }
        case 'checkbox':
          row[column.id] = h % 3 === 0
          break
      }
    })
    return row
  })
}
