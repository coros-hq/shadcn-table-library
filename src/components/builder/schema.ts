import { facetKinds, needsValue, operators } from './filters'
import type {
  FacetDef,
  FacetKind,
  Field,
  FieldType,
  FilterRule,
  Preset,
} from './filters'

export type ColumnType = FieldType

export type Align = 'left' | 'center' | 'right'
export const alignments: Align[] = ['left', 'center', 'right']

export interface ColumnSpec extends Field {
  type: ColumnType
  /** Only set when the user overrides the type's default */
  align?: Align
}

/** Numbers read best right-aligned; everything else starts left */
export const effectiveAlign = (column: ColumnSpec): Align =>
  column.align ?? (column.type === 'number' ? 'right' : 'left')

export type FeatureId =
  'search' | 'sorting' | 'pagination' | 'selection' | 'filters'

export type PagerStyle = 'text' | 'arrows'
export const pagerStyles: { value: PagerStyle; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'arrows', label: 'Arrows' },
]
export const PAGE_SIZES = [5, 10, 20, 50]

export interface PagerSpec {
  style: PagerStyle
  /** Adds a "Rows per page" select */
  sizeSelect: boolean
}

export interface BuilderState {
  columns: ColumnSpec[]
  features: FeatureId[]
  /** One toolbar control per column */
  facets: FacetDef[]
  /** Named one-click shortcuts */
  presets: Preset[]
  pager: PagerSpec
}

export const MAX_COLUMNS = 20
export const MAX_NAME_LENGTH = 40
export const MAX_OPTIONS = 12
export const MAX_PRESETS = 6

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
  { id: 'filters', label: 'Filters', hint: 'Per-column and quick filters' },
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
  facets: [
    { fieldId: 'status', kind: 'options' },
    { fieldId: 'budget', kind: 'range' },
  ],
  presets: [],
  pager: { style: 'text', sizeSelect: false },
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

function ruleFits(columns: ColumnSpec[], rule: FilterRule) {
  const column = columns.find((c) => c.id === rule.fieldId)
  if (!column) return false
  if (!operators[column.type].some((o) => o.op === rule.op)) return false
  return !(
    column.type === 'select' &&
    needsValue(column.type, rule.op) &&
    rule.value !== '' &&
    !(column.options ?? []).includes(rule.value)
  )
}

/** One facet per column, and only a control kind the column type supports */
function pruneFacets(columns: ColumnSpec[], facets: FacetDef[]): FacetDef[] {
  const seen = new Set<string>()
  return facets.filter((facet) => {
    const column = columns.find((c) => c.id === facet.fieldId)
    if (!column || seen.has(facet.fieldId)) return false
    if (!facetKinds[column.type].includes(facet.kind)) return false
    seen.add(facet.fieldId)
    return true
  })
}

function prunePresets(columns: ColumnSpec[], presets: Preset[]): Preset[] {
  return presets.filter((p) => ruleFits(columns, p.rule))
}

function withColumns(state: BuilderState, columns: ColumnSpec[]) {
  return {
    ...state,
    columns,
    facets: pruneFacets(columns, state.facets),
    presets: prunePresets(columns, state.presets),
  }
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

export function setColumnAlign(
  state: BuilderState,
  id: string,
  align: Align,
): BuilderState {
  return withColumns(
    state,
    state.columns.map((c) => (c.id === id ? { ...c, align } : c)),
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
  // A facet or preset written for one type means nothing for another, even
  // when the operator name happens to exist in both ("is" for text and select).
  return withColumns(
    {
      ...state,
      facets: state.facets.filter((f) => f.fieldId !== id),
      presets: state.presets.filter((p) => p.rule.fieldId !== id),
    },
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

export function addFacet(state: BuilderState): BuilderState {
  const used = new Set(state.facets.map((f) => f.fieldId))
  const column = state.columns.find((c) => !used.has(c.id))
  if (!column) return state
  const facet: FacetDef = {
    fieldId: column.id,
    kind: facetKinds[column.type][0],
  }
  return { ...state, facets: [...state.facets, facet] }
}

/** Points a facet at another column, falling back to that type's default control */
export function setFacetColumn(
  state: BuilderState,
  index: number,
  fieldId: string,
): BuilderState {
  const column = state.columns.find((c) => c.id === fieldId)
  const taken = state.facets.some(
    (f, i) => i !== index && f.fieldId === fieldId,
  )
  if (!column || taken || !state.facets[index]) return state
  const facets = state.facets.map((f, i) =>
    i === index ? { fieldId, kind: facetKinds[column.type][0] } : f,
  )
  return { ...state, facets }
}

export function setFacetKind(
  state: BuilderState,
  index: number,
  kind: FacetKind,
): BuilderState {
  const facet = state.facets[index]
  const column = state.columns.find((c) => c.id === facet?.fieldId)
  if (!facet || !column || !facetKinds[column.type].includes(kind)) return state
  return {
    ...state,
    facets: state.facets.map((f, i) => (i === index ? { ...f, kind } : f)),
  }
}

export function removeFacet(state: BuilderState, index: number): BuilderState {
  return { ...state, facets: state.facets.filter((_, i) => i !== index) }
}

export function addPreset(state: BuilderState): BuilderState {
  const column = state.columns[0]
  if (!column || state.presets.length >= MAX_PRESETS) return state
  let n = state.presets.length + 1
  const taken = new Set(state.presets.map((p) => p.id))
  while (taken.has(`preset_${n}`)) n++
  const preset: Preset = {
    id: `preset_${n}`,
    label: `Quick filter ${n}`,
    rule: { fieldId: column.id, op: operators[column.type][0].op, value: '' },
  }
  return { ...state, presets: [...state.presets, preset] }
}

export function updatePreset(
  state: BuilderState,
  id: string,
  patch: { label?: string; rule?: FilterRule },
): BuilderState {
  return {
    ...state,
    presets: state.presets.map((p) =>
      p.id === id
        ? {
            ...p,
            ...(patch.label !== undefined && {
              label: patch.label.slice(0, MAX_NAME_LENGTH),
            }),
            ...(patch.rule && { rule: patch.rule }),
          }
        : p,
    ),
  }
}

export function removePreset(state: BuilderState, id: string): BuilderState {
  return { ...state, presets: state.presets.filter((p) => p.id !== id) }
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

export function reorderColumn(
  state: BuilderState,
  fromId: string,
  toId: string,
): BuilderState {
  const from = state.columns.findIndex((c) => c.id === fromId)
  const to = state.columns.findIndex((c) => c.id === toId)
  if (from < 0 || to < 0 || from === to) return state
  const columns = [...state.columns]
  const [moved] = columns.splice(from, 1)
  columns.splice(to, 0, moved)
  return withColumns(state, columns)
}

// ---------------------------------------------------------------------------
// URL state. One base64url JSON blob keeps the link a single short param.
// ---------------------------------------------------------------------------

type Compact = {
  c: [string, string, string, string[]?, Align?][]
  f: string[]
  fs: [string, FacetKind][]
  ps: [string, string, string, string, string][]
  /** Only present when it differs from the default pager */
  p?: [PagerStyle, 0 | 1]
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
    c: state.columns.map((c) => {
      const options = c.type === 'select' ? (c.options ?? []) : []
      if (c.align) return [c.id, c.name, c.type, options, c.align]
      return c.type === 'select'
        ? [c.id, c.name, c.type, options]
        : [c.id, c.name, c.type]
    }),
    f: state.features,
    fs: state.facets.map((f) => [f.fieldId, f.kind]),
    ps: state.presets.map((p) => [
      p.id,
      p.label,
      p.rule.fieldId,
      p.rule.op,
      p.rule.value,
    ]),
  }
  if (state.pager.style !== 'text' || state.pager.sizeSelect) {
    compact.p = [state.pager.style, state.pager.sizeSelect ? 1 : 0]
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
      fs?: unknown
      ps?: unknown
      p?: unknown
    }
    if (!Array.isArray(raw.c) || !Array.isArray(raw.f)) {
      return defaultState
    }

    const columns: ColumnSpec[] = []
    for (const entry of raw.c.slice(0, MAX_COLUMNS)) {
      if (!Array.isArray(entry)) continue
      const [id, name, type, options, align] = entry as unknown[]
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
      if (isString(align) && alignments.includes(align as Align)) {
        column.align = align as Align
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
    const facetKindIds = Object.values(facetKinds).flat()
    const facets = pruneFacets(
      columns,
      (Array.isArray(raw.fs) ? (raw.fs as unknown[]) : []).flatMap((entry) =>
        Array.isArray(entry) &&
        isString(entry[0]) &&
        isString(entry[1]) &&
        facetKindIds.includes(entry[1] as FacetKind)
          ? [{ fieldId: entry[0], kind: entry[1] as FacetKind }]
          : [],
      ),
    )
    const presets = prunePresets(
      columns,
      (Array.isArray(raw.ps) ? (raw.ps as unknown[]) : [])
        .slice(0, MAX_PRESETS)
        .flatMap((entry) =>
          Array.isArray(entry) && entry.length === 5 && entry.every(isString)
            ? [
                {
                  id: entry[0],
                  label: entry[1].slice(0, MAX_NAME_LENGTH),
                  rule: {
                    fieldId: entry[2],
                    op: entry[3],
                    value: entry[4].slice(0, 100),
                  },
                },
              ]
            : [],
        ) as Preset[],
    ).filter((p, i, all) => all.findIndex((q) => q.id === p.id) === i)

    const pager = { ...defaultState.pager }
    if (Array.isArray(raw.p)) {
      if (raw.p[0] === 'arrows') pager.style = 'arrows'
      pager.sizeSelect = raw.p[1] === 1
    }

    return { columns, features, facets, presets, pager }
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
