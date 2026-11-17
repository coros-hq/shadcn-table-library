import { fields } from './data'
import type { Change, FieldId, Product } from './data'

export type Decision = 'accepted' | 'rejected'

/** Decisions by change key. A key that isn't here is still pending. */
export type Decisions = Readonly<Record<string, Decision>>

// An update is decided field by field; a new or removed record as a whole
export const WHOLE = '*'
export const changeKey = (id: string, field: FieldId | typeof WHOLE) =>
  `${id}.${field}`

export function changedFields(change: Change): FieldId[] {
  if (change.kind !== 'update') return []
  return fields
    .map((f) => f.id)
    .filter((f) => change.before[f] !== change.after[f])
}

export const keysOf = (change: Change) =>
  change.kind === 'update'
    ? changedFields(change).map((f) => changeKey(change.id, f))
    : [changeKey(change.id, WHOLE)]

/** pending: nothing decided yet; partial: some of it decided; mixed: all decided, both ways */
export type RowState = 'pending' | 'partial' | 'accepted' | 'rejected' | 'mixed'

export function rowState(change: Change, decisions: Decisions): RowState {
  const made = keysOf(change).map((k) => decisions[k] as Decision | undefined)
  const pending = made.filter((d) => !d).length
  if (pending === made.length) return 'pending'
  if (pending) return 'partial'
  if (made.every((d) => d === 'accepted')) return 'accepted'
  if (made.every((d) => d === 'rejected')) return 'rejected'
  return 'mixed'
}

/** Accepts, rejects or (with null) reopens the given changes */
export function decide(
  decisions: Decisions,
  keys: string[],
  decision: Decision | null,
): Decisions {
  const next = { ...decisions }
  for (const k of keys) {
    if (decision) next[k] = decision
    else delete next[k]
  }
  return next
}

export function tally(changes: Change[], decisions: Decisions) {
  const keys = changes.flatMap(keysOf)
  const accepted = keys.filter((k) => decisions[k] === 'accepted').length
  const rejected = keys.filter((k) => decisions[k] === 'rejected').length
  return {
    total: keys.length,
    accepted,
    rejected,
    pending: keys.length - accepted - rejected,
  }
}

/**
 * The catalog after applying accepted changes only. Rejected and pending
 * changes leave the record as it was.
 */
export function apply(changes: Change[], decisions: Decisions): Product[] {
  return changes.flatMap((change): Product[] => {
    const whole = decisions[changeKey(change.id, WHOLE)]
    if (change.kind === 'create')
      return whole === 'accepted' ? [change.after] : []
    if (change.kind === 'delete')
      return whole === 'accepted' ? [] : [change.before]
    const next = { ...change.before }
    for (const f of changedFields(change)) {
      if (decisions[changeKey(change.id, f)] === 'accepted') {
        Object.assign(next, { [f]: change.after[f] })
      }
    }
    return [next]
  })
}

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export const formatValue = (field: FieldId, value: Product[FieldId]) =>
  field === 'price'
    ? money.format(value as number)
    : field === 'stock'
      ? (value as number).toLocaleString('en-US')
      : String(value)

/** How much a number moved: "+8.0%" for prices, "+28" for stock */
export function delta(field: FieldId, before: unknown, after: unknown) {
  if (typeof before !== 'number' || typeof after !== 'number') return null
  if (field === 'price') {
    if (before === 0) return null
    const pct = ((after - before) / before) * 100
    return `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`
  }
  const diff = after - before
  return `${diff > 0 ? '+' : ''}${diff.toLocaleString('en-US')}`
}

export type View = 'all' | 'review' | 'accepted' | 'rejected'

export const inView = (state: RowState, view: View) =>
  view === 'all' ||
  (view === 'review'
    ? state === 'pending' || state === 'partial'
    : view === 'accepted'
      ? state === 'accepted' || state === 'mixed'
      : state === 'rejected' || state === 'mixed')

export const fieldLabel = Object.fromEntries(
  fields.map((f) => [f.id, f.label]),
) as Record<FieldId, string>

export type DiffLine =
  | { kind: 'context'; field: FieldId; value: string }
  | {
      kind: 'removed' | 'added'
      field: FieldId
      value: string
      /** Set on lines that belong to a single field's change */
      key?: string
      moved?: string | null
    }

/**
 * The record as a diff: unchanged fields as context, each changed field as a
 * "-" line for the old value and a "+" line for the new one. A new product is
 * all "+", a removed one all "-".
 */
export function diffLines(change: Change): DiffLine[] {
  if (change.kind === 'create') {
    return fields.map((f) => ({
      kind: 'added',
      field: f.id,
      value: formatValue(f.id, change.after[f.id]),
    }))
  }
  if (change.kind === 'delete') {
    return fields.map((f) => ({
      kind: 'removed',
      field: f.id,
      value: formatValue(f.id, change.before[f.id]),
    }))
  }
  const changed = changedFields(change)
  return fields.flatMap((f): DiffLine[] => {
    const before = formatValue(f.id, change.before[f.id])
    if (!changed.includes(f.id)) {
      return [{ kind: 'context', field: f.id, value: before }]
    }
    const key = changeKey(change.id, f.id)
    return [
      { kind: 'removed', field: f.id, value: before, key },
      {
        kind: 'added',
        field: f.id,
        value: formatValue(f.id, change.after[f.id]),
        key,
        moved: delta(f.id, change.before[f.id], change.after[f.id]),
      },
    ]
  })
}
