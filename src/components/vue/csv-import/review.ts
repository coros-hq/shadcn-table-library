import type { CsvData } from './csv'
import { existingEmails, fieldById, fields } from './schema'
import type { FieldId } from './schema'

/** The field each CSV column is imported into, by column index. null means "don't import". */
export type Mapping = (FieldId | null)[]

export interface Issue {
  /** invalid blocks the row; duplicate means the row would create a second copy */
  kind: 'invalid' | 'duplicate'
  message: string
}

export type RowStatus = 'ready' | 'invalid' | 'duplicate' | 'skipped'

export interface ReviewRow {
  id: string
  /** Line in the file, counting the header as line 1 */
  line: number
  cells: string[]
  /** Problems by CSV column index */
  issues: Partial<Record<number, Issue>>
  status: RowStatus
}

const words = (header: string) =>
  header
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

/** Matches headers to fields by name, each field at most once */
export function autoMap(headers: string[]): Mapping {
  const used = new Set<FieldId>()
  return headers.map((header) => {
    const field = fields.find(
      (f) => !used.has(f.id) && f.aliases.includes(words(header)),
    )
    if (!field) return null
    used.add(field.id)
    return field.id
  })
}

/** Points a column at a field, taking the field away from any other column */
export function assign(
  mapping: Mapping,
  column: number,
  field: FieldId | null,
): Mapping {
  return mapping.map((current, i) =>
    i === column ? field : field && current === field ? null : current,
  )
}

export const missingRequired = (mapping: Mapping) =>
  fields.filter((f) => f.required && !mapping.includes(f.id))

/**
 * Validates every row against the mapping. Required fields that aren't mapped
 * are reported by missingRequired() instead, so they aren't repeated per row.
 */
export function review(
  csv: CsvData,
  mapping: Mapping,
  skipped: ReadonlySet<string>,
): ReviewRow[] {
  const emailColumn = mapping.indexOf('email')
  const firstLineByEmail = new Map<string, number>()

  return csv.rows.map((cells, index) => {
    const id = String(index)
    const line = index + 2
    const issues: Partial<Record<number, Issue>> = {}

    mapping.forEach((fieldId, column) => {
      if (!fieldId) return
      const message = fieldById[fieldId].validate(cells[column])
      if (message) issues[column] = { kind: 'invalid', message }
    })

    // Skipped rows don't claim an email, so skipping the first copy frees the second
    if (emailColumn >= 0 && !issues[emailColumn] && !skipped.has(id)) {
      const email = cells[emailColumn].trim().toLowerCase()
      const first = firstLineByEmail.get(email)
      if (existingEmails.has(email)) {
        issues[emailColumn] = {
          kind: 'duplicate',
          message: 'Already a customer in this workspace',
        }
      } else if (first !== undefined) {
        issues[emailColumn] = {
          kind: 'duplicate',
          message: `Same email as line ${first}`,
        }
      } else firstLineByEmail.set(email, line)
    }

    const kinds = Object.values(issues).map((i) => i!.kind)
    const status: RowStatus = skipped.has(id)
      ? 'skipped'
      : kinds.includes('invalid')
        ? 'invalid'
        : kinds.length
          ? 'duplicate'
          : 'ready'
    return { id, line, cells, issues, status }
  })
}

export type CustomerRecord = Partial<Record<FieldId, string | number | null>>

/** The normalized records that would be imported: ready rows only */
export function toRecords(
  rows: ReviewRow[],
  mapping: Mapping,
): CustomerRecord[] {
  return rows
    .filter((row) => row.status === 'ready')
    .map((row) => {
      const record: CustomerRecord = {}
      mapping.forEach((fieldId, column) => {
        if (fieldId)
          record[fieldId] = fieldById[fieldId].normalize(row.cells[column])
      })
      return record
    })
}

export type View = 'all' | 'attention' | 'ready' | 'skipped'

export const inView = (status: RowStatus, view: View) =>
  view === 'all' ||
  (view === 'attention'
    ? status === 'invalid' || status === 'duplicate'
    : status === view)
