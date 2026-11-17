import {
  MAX_COLUMNS,
  MAX_NAME_LENGTH,
  MAX_OPTIONS,
  makeId,
  setColumnOptions,
} from './schema'
import type { BuilderState, ColumnSpec, ColumnType, Row } from './schema'

// Importing data. Parsing and type inference happen here, in plain functions,
// so they can be tested without a browser.
//
// Imported records never enter BuilderState: they stay in the page's memory,
// keyed by column id, and are coerced to each column's *current* type when the
// preview renders. Correcting a column's type re-reads the original values
// instead of the earlier guess.

export const MAX_IMPORT_ROWS = 5000
export const MAX_IMPORT_BYTES = 5 * 1024 * 1024
/** Rows written into the generated data.ts; the rest stay in the preview */
export const MAX_EMBEDDED_ROWS = 50

/** A value as it came in: CSV gives strings, JSON gives anything */
export type RawValue = string | number | boolean | null

export interface ImportedData {
  /** Where it came from, for the banner: a file name or "Pasted JSON" */
  source: string
  /** One raw record per row, keyed by column id */
  records: Record<string, RawValue>[]
  /** Rows dropped past MAX_IMPORT_ROWS */
  truncatedRows: number
  /** Fields dropped past MAX_COLUMNS */
  droppedFields: number
}

export interface ParsedTable {
  headers: string[]
  rows: RawValue[][]
}

export class ImportError extends Error {}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

/** Picks the delimiter that splits the header line into the most fields */
function detectDelimiter(text: string) {
  const firstLine = text.split(/\r?\n/, 1)[0]
  const count = (d: string) => firstLine.split(d).length
  return [',', ';', '\t'].reduce((best, d) =>
    count(d) > count(best) ? d : best,
  )
}

/** RFC 4180 CSV: quoted fields, doubled quotes, newlines inside quotes */
export function parseCsv(input: string): ParsedTable {
  const text = input.replace(/^\uFEFF/, '')
  const delimiter = detectDelimiter(text)
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (ch === '"') {
        quoted = false
      } else {
        field += ch
      }
    } else if (ch === '"' && field === '') {
      quoted = true
    } else if (ch === delimiter) {
      row.push(field)
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += ch
    }
  }
  if (quoted) throw new ImportError('A quoted field is never closed.')
  if (field !== '' || row.length) {
    row.push(field)
    rows.push(row)
  }

  // Blank lines carry no record
  const lines = rows.filter((r) => r.some((cell) => cell.trim() !== ''))
  if (lines.length < 2) {
    throw new ImportError('Add a header row and at least one row of data.')
  }
  const [headers, ...body] = lines
  return {
    headers,
    rows: body.map((r) => headers.map((_, i) => r[i] ?? '')),
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Nested values have no column type, so they're kept as JSON text */
function toRaw(value: unknown): RawValue {
  if (value === null || value === undefined) return null
  if (
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value))
  ) {
    return value
  }
  return JSON.stringify(value)
}

/**
 * An array of objects, or an object holding one (`{ "data": [...] }`, the
 * shape most APIs answer with).
 */
export function parseJson(input: string): ParsedTable {
  let value: unknown
  try {
    value = JSON.parse(input)
  } catch {
    throw new ImportError("This isn't valid JSON.")
  }
  const list = Array.isArray(value)
    ? value
    : isRecord(value)
      ? Object.values(value).find(
          (v): v is unknown[] => Array.isArray(v) && v.some(isRecord),
        )
      : undefined
  const records = (list ?? []).filter(isRecord)
  if (records.length === 0) {
    throw new ImportError(
      'Paste an array of objects, like [{ "name": "Ada" }].',
    )
  }

  // Every key seen, in order of first appearance
  const headers: string[] = []
  const seen = new Set<string>()
  for (const record of records) {
    for (const key of Object.keys(record)) {
      if (!seen.has(key)) {
        seen.add(key)
        headers.push(key)
      }
    }
  }
  return {
    headers,
    rows: records.map((r) => headers.map((h) => toRaw(r[h]))),
  }
}

/** JSON when it looks like JSON, CSV otherwise */
export function parseInput(input: string): ParsedTable {
  const text = input.trim()
  if (!text) throw new ImportError('Paste some data first.')
  if (input.length > MAX_IMPORT_BYTES) {
    throw new ImportError('That is more than 5 MB. Try a smaller sample.')
  }
  return /^[[{]/.test(text) ? parseJson(text) : parseCsv(text)
}

// ---------------------------------------------------------------------------
// Inference
// ---------------------------------------------------------------------------

const isEmpty = (value: RawValue) =>
  value === null || (typeof value === 'string' && value.trim() === '')

const TRUE = new Set(['true', 'yes', 'y'])
const FALSE = new Set(['false', 'no', 'n'])

function asBoolean(value: RawValue): boolean | undefined {
  if (typeof value === 'boolean') return value
  if (typeof value !== 'string') return undefined
  const v = value.trim().toLowerCase()
  return TRUE.has(v) ? true : FALSE.has(v) ? false : undefined
}

/** Plain numbers, and "1,234.5" with thousands separators */
function asNumber(value: RawValue): number | undefined {
  if (typeof value === 'number') return value
  if (typeof value !== 'string') return undefined
  const v = value.trim()
  if (!/^-?(\d+|\d{1,3}(,\d{3})+)(\.\d+)?$/.test(v)) return undefined
  return Number(v.replace(/,/g, ''))
}

/** ISO dates and date-times only: "03/04/2025" could be March or April */
function asDate(value: RawValue): string | undefined {
  if (typeof value !== 'string') return undefined
  const v = value.trim()
  const match = /^(\d{4}-\d{2}-\d{2})([T ][\d:.]+(Z|[+-]\d{2}:?\d{2})?)?$/.exec(
    v,
  )
  if (!match || Number.isNaN(Date.parse(`${match[1]}T00:00:00Z`))) {
    return undefined
  }
  return match[1]
}

const text = (value: RawValue) =>
  typeof value === 'string' ? value.trim() : String(value ?? '')

/** Distinct non-empty values, in order of first appearance */
export function distinctValues(values: RawValue[]) {
  return [...new Set(values.filter((v) => !isEmpty(v)).map(text))]
}

/**
 * Select when a short list of values keeps repeating (a status, a plan),
 * text otherwise. A column where every value is different, like names,
 * would make a poor filter and would put records into the shared link.
 */
function looksLikeSelect(values: string[], filled: number) {
  return (
    values.length > 0 &&
    values.length <= MAX_OPTIONS &&
    values.length * 2 <= filled &&
    values.every((v) => v.length <= MAX_NAME_LENGTH)
  )
}

export function inferType(values: RawValue[]): ColumnType {
  const filled = values.filter((v) => !isEmpty(v))
  if (filled.length === 0) return 'text'
  if (filled.every((v) => asBoolean(v) !== undefined)) return 'checkbox'
  if (filled.every((v) => asNumber(v) !== undefined)) return 'number'
  if (filled.every((v) => asDate(v) !== undefined)) return 'date'
  return looksLikeSelect(distinctValues(filled), filled.length)
    ? 'select'
    : 'text'
}

/** Names as columns: trimmed, never empty, never repeated */
function columnNames(headers: string[]) {
  const used = new Set<string>()
  return headers.map((header, i) => {
    const base = header.trim().slice(0, MAX_NAME_LENGTH) || `Column ${i + 1}`
    let name = base
    for (let n = 2; used.has(name); n++) {
      name = `${base.slice(0, MAX_NAME_LENGTH - 3)} ${n}`
    }
    used.add(name)
    return name
  })
}

/** Builder columns for a parsed table, and its records keyed by their ids */
export function inferImport(
  table: ParsedTable,
  source: string,
): { columns: ColumnSpec[]; data: ImportedData } {
  const headers = table.headers.slice(0, MAX_COLUMNS)
  const rows = table.rows.slice(0, MAX_IMPORT_ROWS)
  const names = columnNames(headers)
  const columns: ColumnSpec[] = []
  for (const [i, name] of names.entries()) {
    const values = rows.map((r) => r[i])
    const type = inferType(values)
    const column: ColumnSpec = {
      id: makeId(
        name,
        columns.map((c) => c.id),
      ),
      name,
      type,
    }
    if (type === 'select') column.options = distinctValues(values)
    columns.push(column)
  }
  return {
    columns,
    data: {
      source,
      records: rows.map((r) =>
        Object.fromEntries(columns.map((c, i) => [c.id, r[i] ?? null])),
      ),
      truncatedRows: Math.max(table.rows.length - MAX_IMPORT_ROWS, 0),
      droppedFields: Math.max(table.headers.length - MAX_COLUMNS, 0),
    },
  }
}

/** Options for a column that became a select after the import */
export function optionsFromData(data: ImportedData, columnId: string) {
  const values = distinctValues(data.records.map((r) => r[columnId] ?? null))
  return values.length > 0 && values.length <= MAX_OPTIONS ? values : undefined
}

/**
 * After a schema edit: a column that just became a select gets its options
 * from the imported values instead of "Option 1, 2, 3".
 */
export function withDataOptions(
  prev: BuilderState,
  next: BuilderState,
  data: ImportedData,
): BuilderState {
  let state = next
  for (const column of next.columns) {
    const before = prev.columns.find((c) => c.id === column.id)
    if (column.type !== 'select' || !before || before.type === 'select')
      continue
    const options = optionsFromData(data, column.id)
    if (options) state = setColumnOptions(state, column.id, options)
  }
  return state
}

/**
 * Whether the data still fits the schema. After an undo back past the import
 * the columns no longer match the records, and sample rows read better than
 * a table of blanks.
 */
export function matchesData(columns: ColumnSpec[], data: ImportedData) {
  const keys = new Set(Object.keys(data.records[0] ?? {}))
  const matched = columns.filter((c) => keys.has(c.id)).length
  // Most columns must come from the data: a schema that only shares a "name"
  // column with it is a different table
  return matched > 0 && matched * 2 >= columns.length
}

// ---------------------------------------------------------------------------
// Coercion: raw records -> rows typed by the columns as they are now
// ---------------------------------------------------------------------------

function coerce(type: ColumnType, value: RawValue): Row[string] {
  switch (type) {
    case 'number':
      // An empty or unreadable number stays empty rather than turning into 0
      return asNumber(value) ?? null
    case 'checkbox':
      return asBoolean(value) ?? false
    case 'date':
      return asDate(value) ?? ''
    case 'text':
    case 'select':
      return isEmpty(value) ? '' : text(value)
  }
}

export function coerceRows(columns: ColumnSpec[], data: ImportedData): Row[] {
  return data.records.map((record, i) => {
    const row: Row = { id: String(i + 1) }
    for (const column of columns) {
      // Columns added after the import have no data yet
      row[column.id] = coerce(column.type, record[column.id] ?? null)
    }
    return row
  })
}
