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

export type Pin = 'left' | 'right'
export const pins: Pin[] = ['left', 'right']

/**
 * What an edited value must satisfy before it is saved. `min`/`max` bound the
 * value for numbers and the length for text. Only the rules a column's type
 * supports are kept (see `ruleKeys`).
 */
export interface ValidationSpec {
  required?: boolean
  min?: number
  max?: number
  integer?: boolean
}

export const ruleKeys: Record<ColumnType, (keyof ValidationSpec)[]> = {
  text: ['required', 'min', 'max'],
  number: ['min', 'max', 'integer'],
  date: ['required'],
  select: [],
  checkbox: [],
}

export interface ColumnSpec extends Field {
  type: ColumnType
  /** Only set when the user overrides the type's default */
  align?: Align
  /** With editing on every column is editable unless it opts out */
  readOnly?: boolean
  rules?: ValidationSpec
  /** Where the column sticks when pinning is on */
  pin?: Pin
}

/** Numbers read best right-aligned; everything else starts left */
export const effectiveAlign = (column: ColumnSpec): Align =>
  column.align ?? (column.type === 'number' ? 'right' : 'left')

export type FeatureId =
  | 'search'
  | 'sorting'
  | 'pagination'
  | 'selection'
  | 'filters'
  | 'editing'
  | 'rowActions'
  | 'columnVisibility'
  | 'pinning'
  | 'export'

export type RowActionId = 'copy' | 'duplicate' | 'delete'
export const rowActionOptions: { value: RowActionId; label: string }[] = [
  { value: 'copy', label: 'Copy ID' },
  { value: 'duplicate', label: 'Duplicate' },
  { value: 'delete', label: 'Delete' },
]

export type ExportFormat = 'csv' | 'excel'
export const exportFormats: { value: ExportFormat; label: string }[] = [
  { value: 'csv', label: 'CSV' },
  { value: 'excel', label: 'Excel' },
]
export const MAX_FILENAME_LENGTH = 40

export interface ExportSpec {
  formats: ExportFormat[]
  /** Without the extension */
  filename: string
}

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

export type LoadingStyle = 'skeleton' | 'spinner'
export const loadingStyles: { value: LoadingStyle; label: string }[] = [
  { value: 'skeleton', label: 'Skeleton' },
  { value: 'spinner', label: 'Spinner' },
]
export const SKELETON_ROWS = [3, 5, 8, 10]
export const MAX_MESSAGE_LENGTH = 120

/** What the table shows when it has no rows, and while rows are on the way */
export interface StatesSpec {
  emptyTitle: string
  emptyDescription: string
  loadingStyle: LoadingStyle
  /** Placeholder rows, for the skeleton style */
  loadingRows: number
  /** Shown next to the spinner, and announced to screen readers */
  loadingMessage: string
}

export interface BuilderState {
  columns: ColumnSpec[]
  features: FeatureId[]
  /** One toolbar control per column */
  facets: FacetDef[]
  /** Named one-click shortcuts */
  presets: Preset[]
  pager: PagerSpec
  states: StatesSpec
  /** The row menu's items, in menu order */
  actions: RowActionId[]
  exporting: ExportSpec
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
  { id: 'editing', label: 'Editable cells', hint: 'Click a cell to edit' },
  { id: 'rowActions', label: 'Row actions', hint: 'Menu on each row' },
  {
    id: 'columnVisibility',
    label: 'Column visibility',
    hint: 'Show or hide columns',
  },
  { id: 'pinning', label: 'Column pinning', hint: 'Sticky left or right' },
  { id: 'export', label: 'Export', hint: 'Download CSV or Excel' },
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
  states: {
    emptyTitle: 'No results',
    emptyDescription: 'Try changing your search or filters.',
    loadingStyle: 'skeleton',
    loadingRows: 5,
    loadingMessage: 'Loading...',
  },
  actions: ['copy', 'duplicate', 'delete'],
  exporting: { formats: ['csv', 'excel'], filename: 'table-export' },
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

/** Swaps in a whole new set of columns, dropping filters that no longer fit */
export function replaceColumns(
  state: BuilderState,
  columns: ColumnSpec[],
): BuilderState {
  return withColumns(state, columns.slice(0, MAX_COLUMNS))
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
    // Rules are written for one type ("min" is a length for text, a value
    // for numbers), so they never carry over
    const { options: _dropped, rules: _rules, ...rest } = c
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

export function setColumnReadOnly(
  state: BuilderState,
  id: string,
  readOnly: boolean,
): BuilderState {
  return withColumns(
    state,
    state.columns.map((c) => {
      if (c.id !== id) return c
      const { readOnly: _dropped, ...rest } = c
      return readOnly ? { ...rest, readOnly: true } : rest
    }),
  )
}

/** Keeps only the rules the type supports, with sane numbers */
export function cleanRules(
  type: ColumnType,
  rules: ValidationSpec | undefined,
): ValidationSpec | undefined {
  if (!rules) return undefined
  const allowed = ruleKeys[type]
  const out: ValidationSpec = {}
  if (allowed.includes('required') && rules.required) out.required = true
  if (allowed.includes('integer') && rules.integer) out.integer = true
  for (const key of ['min', 'max'] as const) {
    const value = rules[key]
    if (!allowed.includes(key) || typeof value !== 'number') continue
    if (!Number.isFinite(value)) continue
    // A length can't be negative or fractional
    if (type === 'text') {
      if (value >= 0) out[key] = Math.min(Math.floor(value), 10_000)
    } else {
      out[key] = value
    }
  }
  return Object.keys(out).length ? out : undefined
}

export function setColumnRules(
  state: BuilderState,
  id: string,
  patch: ValidationSpec,
): BuilderState {
  return withColumns(
    state,
    state.columns.map((c) => {
      if (c.id !== id) return c
      const { rules: _dropped, ...rest } = c
      const rules = cleanRules(c.type, { ...c.rules, ...patch })
      return rules ? { ...rest, rules } : rest
    }),
  )
}

export function setColumnPin(
  state: BuilderState,
  id: string,
  pin: Pin | undefined,
): BuilderState {
  return withColumns(
    state,
    state.columns.map((c) => {
      if (c.id !== id) return c
      const { pin: _dropped, ...rest } = c
      return pin ? { ...rest, pin } : rest
    }),
  )
}

export function toggleRowAction(
  state: BuilderState,
  action: RowActionId,
): BuilderState {
  const on = state.actions.includes(action)
  // Keep menu order stable whatever order they were switched on in
  const actions = rowActionOptions
    .map((a) => a.value)
    .filter((a) => (a === action ? !on : state.actions.includes(a)))
  return { ...state, actions }
}

export function setExport(
  state: BuilderState,
  patch: Partial<ExportSpec>,
): BuilderState {
  const formats = exportFormats
    .map((f) => f.value)
    .filter((f) => (patch.formats ?? state.exporting.formats).includes(f))
  // An export menu with nothing in it would be a dead button
  if (formats.length === 0) return state
  const filename = (patch.filename ?? state.exporting.filename)
    .replace(/[^\w .-]/g, '')
    .slice(0, MAX_FILENAME_LENGTH)
  return { ...state, exporting: { formats, filename } }
}

/** What the generated code falls back to when the name is cleared */
export const exportFilename = (spec: ExportSpec) =>
  spec.filename.trim() || defaultState.exporting.filename

export function setStates(
  state: BuilderState,
  patch: Partial<StatesSpec>,
): BuilderState {
  const next = { ...state.states, ...patch }
  return {
    ...state,
    states: {
      ...next,
      emptyTitle: next.emptyTitle.slice(0, MAX_MESSAGE_LENGTH),
      emptyDescription: next.emptyDescription.slice(0, MAX_MESSAGE_LENGTH),
      loadingMessage: next.loadingMessage.slice(0, MAX_MESSAGE_LENGTH),
    },
  }
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

/** Per-column settings beyond the basics, only present when set */
type CompactExtras = {
  ro?: 1
  rq?: 1
  mn?: number
  mx?: number
  in?: 1
  p?: Pin
}

type Compact = {
  c: [string, string, string, string[]?, (Align | 0)?, CompactExtras?][]
  f: string[]
  fs: [string, FacetKind][]
  ps: [string, string, string, string, string][]
  /** Only present when it differs from the default pager */
  p?: [PagerStyle, 0 | 1]
  /** Only present when it differs from the default messages */
  s?: [string, string, LoadingStyle, number, string]
  /** Row actions, only when they differ from the default */
  a?: RowActionId[]
  /** Export formats and filename, only when they differ from the default */
  x?: [ExportFormat[], string]
}

function columnExtras(c: ColumnSpec): CompactExtras | undefined {
  const extras: CompactExtras = {}
  if (c.readOnly) extras.ro = 1
  if (c.rules?.required) extras.rq = 1
  if (c.rules?.min !== undefined) extras.mn = c.rules.min
  if (c.rules?.max !== undefined) extras.mx = c.rules.max
  if (c.rules?.integer) extras.in = 1
  if (c.pin) extras.p = c.pin
  return Object.keys(extras).length ? extras : undefined
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
      const extras = columnExtras(c)
      if (extras) return [c.id, c.name, c.type, options, c.align ?? 0, extras]
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
  const t = state.states
  if (JSON.stringify(t) !== JSON.stringify(defaultState.states)) {
    compact.s = [
      t.emptyTitle,
      t.emptyDescription,
      t.loadingStyle,
      t.loadingRows,
      t.loadingMessage,
    ]
  }
  if (state.actions.join() !== defaultState.actions.join()) {
    compact.a = state.actions
  }
  const x = state.exporting
  if (JSON.stringify(x) !== JSON.stringify(defaultState.exporting)) {
    compact.x = [x.formats, x.filename]
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
      s?: unknown
      a?: unknown
      x?: unknown
    }
    if (!Array.isArray(raw.c) || !Array.isArray(raw.f)) {
      return defaultState
    }

    const columns: ColumnSpec[] = []
    for (const entry of raw.c.slice(0, MAX_COLUMNS)) {
      if (!Array.isArray(entry)) continue
      const [id, name, type, options, align, extras] = entry as unknown[]
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
      if (extras && typeof extras === 'object' && !Array.isArray(extras)) {
        const e = extras as Record<string, unknown>
        if (e.ro === 1) column.readOnly = true
        if (e.p === 'left' || e.p === 'right') column.pin = e.p
        const rules = cleanRules(column.type, {
          required: e.rq === 1,
          integer: e.in === 1,
          min: typeof e.mn === 'number' ? e.mn : undefined,
          max: typeof e.mx === 'number' ? e.mx : undefined,
        })
        if (rules) column.rules = rules
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

    const states = { ...defaultState.states }
    if (Array.isArray(raw.s)) {
      const [title, description, style, rows, message] = raw.s as unknown[]
      if (isString(title)) states.emptyTitle = title
      if (isString(description)) states.emptyDescription = description
      if (style === 'skeleton' || style === 'spinner') {
        states.loadingStyle = style
      }
      if (typeof rows === 'number' && SKELETON_ROWS.includes(rows)) {
        states.loadingRows = rows
      }
      if (isString(message)) states.loadingMessage = message
    }

    const actions = Array.isArray(raw.a)
      ? rowActionOptions
          .map((a) => a.value)
          .filter((a) => (raw.a as unknown[]).includes(a))
      : defaultState.actions

    let exporting = defaultState.exporting
    if (Array.isArray(raw.x)) {
      const [formats, filename] = raw.x as unknown[]
      exporting = setExport(defaultState, {
        formats: Array.isArray(formats)
          ? exportFormats
              .map((f) => f.value)
              .filter((f) => (formats as unknown[]).includes(f))
          : undefined,
        filename: isString(filename) ? filename : undefined,
      }).exporting
    }

    return {
      columns,
      features,
      facets,
      presets,
      pager,
      states: setStates({ ...defaultState, states }, {}).states,
      actions,
      exporting,
    }
  } catch {
    return defaultState
  }
}

// ---------------------------------------------------------------------------
// Sample data. Deterministic, so the preview, the generated data.ts and a
// server render all agree.
// ---------------------------------------------------------------------------

/** `null` is an empty number cell in imported data */
export type Row = Record<string, string | number | boolean | null>

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
