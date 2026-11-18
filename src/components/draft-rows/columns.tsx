import type { KeyboardEvent, ReactNode } from 'react'
import { TriangleAlert, X } from 'lucide-react'
import type { ColumnDef, Table } from '@tanstack/react-table'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import type { Expense } from './data'
import { formatDate, money, parseAmount } from './drafts'
import type { Draft, Errors, Field } from './drafts'
import { CategoryField, DateField } from './pickers'

/** Saved expenses and draft rows share one table */
export type Row =
  | { kind: 'saved'; id: string; expense: Expense }
  | { kind: 'draft'; id: string; draft: Draft; number: number }

export interface DraftMeta {
  /** Errors to show: only for fields left once, or all after a save attempt */
  shownErrors: (id: string) => Errors
  duplicates: Set<string>
  saving: boolean
  update: (id: string, field: Field, value: string) => void
  touch: (id: string, field: Field) => void
  remove: (id: string) => void
  /** Enter in a text field: go to the same field one row down */
  next: (id: string, field: Field) => void
}

const getMeta = (table: Table<Row>) =>
  table.options.meta as unknown as DraftMeta

const errorId = (id: string, field: Field) => `${id}-${field}-error`

/** An input with its error message under it */
function Cell({
  row,
  field,
  meta,
  children,
}: {
  row: Extract<Row, { kind: 'draft' }>
  field: Field
  meta: DraftMeta
  children: (props: {
    'data-draft': string
    'data-field': Field
    'aria-invalid': boolean
    'aria-describedby': string | undefined
    disabled: boolean
    onBlur: () => void
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => void
  }) => ReactNode
}) {
  const error = meta.shownErrors(row.id)[field]
  return (
    <div className="space-y-1">
      {children({
        'data-draft': row.id,
        'data-field': field,
        'aria-invalid': !!error,
        'aria-describedby': error ? errorId(row.id, field) : undefined,
        disabled: meta.saving,
        onBlur: () => meta.touch(row.id, field),
        onKeyDown: (event) => {
          if (event.key !== 'Enter' || event.nativeEvent.isComposing) return
          event.preventDefault()
          meta.next(row.id, field)
        },
      })}
      {error ? (
        <p id={errorId(row.id, field)} className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

const label = (row: Extract<Row, { kind: 'draft' }>, what: string) =>
  `${what}, new row ${row.number}`

export const columns: ColumnDef<Row>[] = [
  {
    id: 'date',
    header: 'Date',
    cell: ({ row: { original: row }, table }) =>
      row.kind === 'saved' ? (
        <span className="tabular-nums">{formatDate(row.expense.date)}</span>
      ) : (
        <Cell row={row} field="date" meta={getMeta(table)}>
          {({ onBlur, onKeyDown: _, ...control }) => (
            <DateField
              value={row.draft.date}
              label={label(row, 'Date')}
              control={control}
              onChange={(iso) => getMeta(table).update(row.id, 'date', iso)}
              onClose={onBlur}
            />
          )}
        </Cell>
      ),
  },
  {
    id: 'description',
    header: 'Description',
    cell: ({ row: { original: row }, table }) =>
      row.kind === 'saved' ? (
        row.expense.description
      ) : (
        <Cell row={row} field="description" meta={getMeta(table)}>
          {(props) => (
            <Input
              {...props}
              aria-label={label(row, 'Description')}
              placeholder="What was it for?"
              value={row.draft.description}
              onChange={(e) =>
                getMeta(table).update(row.id, 'description', e.target.value)
              }
              className="h-8 min-w-44 px-2"
            />
          )}
        </Cell>
      ),
  },
  {
    id: 'category',
    header: 'Category',
    cell: ({ row: { original: row }, table }) =>
      row.kind === 'saved' ? (
        row.expense.category
      ) : (
        <Cell row={row} field="category" meta={getMeta(table)}>
          {({ onBlur, onKeyDown: _, ...control }) => (
            <CategoryField
              value={row.draft.category}
              label={label(row, 'Category')}
              control={control}
              onChange={(value) =>
                getMeta(table).update(row.id, 'category', value)
              }
              onClose={onBlur}
            />
          )}
        </Cell>
      ),
  },
  {
    id: 'amount',
    header: () => <span className="block text-right">Amount</span>,
    cell: ({ row: { original: row }, table }) => {
      if (row.kind === 'saved') {
        return (
          <span className="block text-right tabular-nums">
            {money(row.expense.amount)}
          </span>
        )
      }
      const meta = getMeta(table)
      return (
        <Cell row={row} field="amount" meta={meta}>
          {(props) => (
            <Input
              {...props}
              inputMode="decimal"
              aria-label={label(row, 'Amount in dollars')}
              placeholder="0.00"
              value={row.draft.amount}
              onChange={(e) => meta.update(row.id, 'amount', e.target.value)}
              onBlur={() => {
                // Tidy "12.5" into "12.50" once the user moves on
                const n = parseAmount(row.draft.amount)
                if (Number.isFinite(n) && !/\.\d{3,}$/.test(row.draft.amount))
                  meta.update(row.id, 'amount', n.toFixed(2))
                props.onBlur()
              }}
              className="ml-auto h-8 w-28 px-2 text-right tabular-nums"
            />
          )}
        </Cell>
      )
    },
  },
  {
    id: 'actions',
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row: { original: row }, table }) => {
      if (row.kind === 'saved') return null
      const meta = getMeta(table)
      return (
        <div className="flex items-center justify-end gap-1">
          {meta.duplicates.has(row.id) ? (
            <span
              title="Same date, amount and description as another expense"
              className="flex items-center gap-1 text-xs whitespace-nowrap text-amber-700 dark:text-amber-400"
            >
              <TriangleAlert aria-hidden className="size-3.5" />
              Duplicate?
            </span>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            disabled={meta.saving}
            aria-label={`Remove new row ${row.number}`}
            onClick={() => meta.remove(row.id)}
          >
            <X />
          </Button>
        </div>
      )
    },
  },
]
