// Standalone on purpose: the Table Builder copies this file verbatim into the
// generated code, so it must not import anything from the builder.

export type FieldType = 'text' | 'number' | 'select' | 'date' | 'checkbox'

export type FilterOp =
  | 'contains'
  | 'notContains'
  | 'is'
  | 'isNot'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'before'
  | 'after'
  | 'on'
  | 'checked'
  | 'unchecked'

export interface Field {
  id: string
  name: string
  type: FieldType
  /** Choices for `select` fields */
  options?: string[]
}

export interface FilterRule {
  fieldId: string
  op: FilterOp
  value: string
}

interface Operator {
  op: FilterOp
  label: string
  needsValue: boolean
}

export const operators: Record<FieldType, Operator[]> = {
  text: [
    { op: 'contains', label: 'contains', needsValue: true },
    { op: 'notContains', label: 'does not contain', needsValue: true },
    { op: 'is', label: 'is', needsValue: true },
    { op: 'isEmpty', label: 'is empty', needsValue: false },
    { op: 'isNotEmpty', label: 'is not empty', needsValue: false },
  ],
  number: [
    { op: 'eq', label: '=', needsValue: true },
    { op: 'neq', label: '≠', needsValue: true },
    { op: 'gt', label: '>', needsValue: true },
    { op: 'gte', label: '≥', needsValue: true },
    { op: 'lt', label: '<', needsValue: true },
    { op: 'lte', label: '≤', needsValue: true },
  ],
  select: [
    { op: 'is', label: 'is', needsValue: true },
    { op: 'isNot', label: 'is not', needsValue: true },
  ],
  date: [
    { op: 'before', label: 'is before', needsValue: true },
    { op: 'after', label: 'is after', needsValue: true },
    { op: 'on', label: 'is', needsValue: true },
  ],
  checkbox: [
    { op: 'checked', label: 'is checked', needsValue: false },
    { op: 'unchecked', label: 'is unchecked', needsValue: false },
  ],
}

export function needsValue(type: FieldType, op: FilterOp) {
  return operators[type].find((o) => o.op === op)?.needsValue ?? false
}

function matches(cell: unknown, rule: FilterRule, type: FieldType) {
  const text = typeof cell === 'string' ? cell : ''
  const query = rule.value.trim().toLowerCase()

  switch (rule.op) {
    case 'contains':
      return text.toLowerCase().includes(query)
    case 'notContains':
      return !text.toLowerCase().includes(query)
    case 'is':
      return type === 'select'
        ? cell === rule.value
        : text.toLowerCase() === query
    case 'isNot':
      return cell !== rule.value
    case 'isEmpty':
      return text === ''
    case 'isNotEmpty':
      return text !== ''
    case 'eq':
      return Number(cell) === Number(rule.value)
    case 'neq':
      return Number(cell) !== Number(rule.value)
    case 'gt':
      return Number(cell) > Number(rule.value)
    case 'gte':
      return Number(cell) >= Number(rule.value)
    case 'lt':
      return Number(cell) < Number(rule.value)
    case 'lte':
      return Number(cell) <= Number(rule.value)
    // ISO dates (YYYY-MM-DD) compare correctly as strings
    case 'before':
      return text < rule.value
    case 'after':
      return text > rule.value
    case 'on':
      return text === rule.value
    case 'checked':
      return cell === true
    case 'unchecked':
      return cell !== true
  }
}

/**
 * Keeps the rows that satisfy every rule. A rule that still needs a value (or
 * a number that is not a number yet) is ignored, so adding a rule never blanks
 * the table before you have typed anything.
 */
export function applyRules<T extends Record<string, unknown>>(
  rows: T[],
  fields: Field[],
  rules: FilterRule[],
): T[] {
  const active = rules.flatMap((rule) => {
    const field = fields.find((f) => f.id === rule.fieldId)
    if (!field) return []
    if (needsValue(field.type, rule.op) && rule.value.trim() === '') return []
    if (field.type === 'number' && Number.isNaN(Number(rule.value))) return []
    return [{ rule, field }]
  })
  if (active.length === 0) return rows
  return rows.filter((row) =>
    active.every(({ rule, field }) => matches(row[field.id], rule, field.type)),
  )
}

// ---------------------------------------------------------------------------
// Facets: one control per column in the toolbar (a dropdown of options, a
// min/max range, ...). Each facet narrows the rows on its own; all of them and
// every active quick filter must match.
// ---------------------------------------------------------------------------

export type FacetKind = 'options' | 'text' | 'range' | 'dateRange' | 'boolean'

/** The control kinds a column type supports; the first is the default */
export const facetKinds: Record<FieldType, FacetKind[]> = {
  text: ['text', 'options'],
  number: ['range'],
  select: ['options'],
  date: ['dateRange'],
  checkbox: ['boolean'],
}

export const facetKindLabels: Record<FacetKind, string> = {
  options: 'Options',
  text: 'Search',
  range: 'Range',
  dateRange: 'Date range',
  boolean: 'Yes / no',
}

export interface FacetDef {
  fieldId: string
  kind: FacetKind
}

/** A named shortcut that toggles one fixed rule, like "High budget" */
export interface Preset {
  id: string
  label: string
  rule: FilterRule
}

/** What the user has entered into one facet; each kind reads what it needs */
export interface FacetValue {
  /** `options`: the chosen options. `boolean`: ['yes'] or ['no'] */
  values: string[]
  /** `text` */
  text: string
  /** `range` and `dateRange` bounds, inclusive */
  min: string
  max: string
}

export const emptyFacet: FacetValue = { values: [], text: '', min: '', max: '' }

export function isFacetActive(kind: FacetKind, value: FacetValue | undefined) {
  if (!value) return false
  switch (kind) {
    case 'options':
    case 'boolean':
      return value.values.length > 0
    case 'text':
      return value.text.trim() !== ''
    case 'range':
    case 'dateRange':
      return value.min !== '' || value.max !== ''
  }
}

function matchesFacet(cell: unknown, kind: FacetKind, value: FacetValue) {
  switch (kind) {
    case 'options':
      return value.values.includes(String(cell))
    case 'boolean':
      return value.values[0] === 'yes' ? cell === true : cell !== true
    case 'text':
      return String(cell ?? '')
        .toLowerCase()
        .includes(value.text.trim().toLowerCase())
    case 'range': {
      const n = Number(cell)
      if (value.min !== '' && !Number.isNaN(Number(value.min))) {
        if (n < Number(value.min)) return false
      }
      if (value.max !== '' && !Number.isNaN(Number(value.max))) {
        if (n > Number(value.max)) return false
      }
      return true
    }
    case 'dateRange': {
      // ISO dates (YYYY-MM-DD) compare correctly as strings
      const text = String(cell ?? '')
      return (
        (value.min === '' || text >= value.min) &&
        (value.max === '' || text <= value.max)
      )
    }
  }
}

/** Keeps the rows that pass every facet the user has filled in */
export function applyFacets<T extends Record<string, unknown>>(
  rows: T[],
  facets: FacetDef[],
  values: Record<string, FacetValue>,
): T[] {
  const active = facets.filter((f) => isFacetActive(f.kind, values[f.fieldId]))
  if (active.length === 0) return rows
  return rows.filter((row) =>
    active.every((f) =>
      matchesFacet(row[f.fieldId], f.kind, values[f.fieldId]),
    ),
  )
}
