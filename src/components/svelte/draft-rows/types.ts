import type { Expense } from './data'
import type { Draft, Errors, Field } from './drafts'

/** Saved expenses and draft rows share one table */
export type Row =
  | { kind: 'saved'; id: string; expense: Expense }
  | { kind: 'draft'; id: string; draft: Draft; number: number }

export type DraftRow = Extract<Row, { kind: 'draft' }>

export interface DraftMeta {
  /** Errors to show: only for fields left once, or all after a save attempt */
  shownErrors: (id: string) => Errors
  duplicates: Set<string>
  saving: boolean
  update: (id: string, field: Field, value: string) => void
  touch: (id: string, field: Field) => void
  remove: (id: string) => void
  /** Enter in a field: go to the same field one row down */
  next: (id: string, field: Field) => void
}
