import { useEffect, useMemo, useRef, useState } from 'react'
import { LoaderCircle, Plus, TriangleAlert } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { periodLabel, saved as initialSaved } from './data'
import type { Expense } from './data'
import type { DraftMeta, Row } from './columns'
import { DraftRowsTable } from './data-table'
import {
  batch,
  duplicates,
  emptyDraft,
  fields,
  isBlank,
  money,
  toExpense,
  validate,
} from './drafts'
import type { Draft, Errors, Field } from './drafts'

// One row ready to save, one missing its amount, one that repeats a saved
// expense, so every state is on screen from the start
const initialDrafts: Draft[] = [
  {
    id: 'draft-1',
    date: '2026-11-12',
    description: 'Taxi to airport',
    category: 'Travel',
    amount: '42.80',
  },
  {
    id: 'draft-2',
    date: '2026-11-12',
    description: 'Team lunch',
    category: 'Meals',
    amount: '',
  },
  {
    id: 'draft-3',
    date: '2026-11-04',
    description: 'Client dinner',
    category: 'Meals',
    amount: '148.50',
  },
]

const SAVE_DELAY = 700

export function DraftRowsDemo() {
  const [saved, setSaved] = useState<Expense[]>(initialSaved)
  const [drafts, setDrafts] = useState<Draft[]>(initialDrafts)
  // `${id}:${field}` for every field the user has left at least once
  const [touched, setTouched] = useState<Set<string>>(new Set())
  // After a failed save, every error shows, touched or not
  const [attempted, setAttempted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [fresh, setFresh] = useState<Set<string>>(new Set())
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [message, setMessage] = useState('')

  const nextId = useRef(4)
  const root = useRef<HTMLDivElement>(null)
  // Focus to move once the rows it points at have rendered
  const focusTarget = useRef<{ id: string; field: Field } | null>(null)

  useEffect(() => {
    const target = focusTarget.current
    if (!target) return
    focusTarget.current = null
    root.current
      ?.querySelector<HTMLElement>(
        `[data-draft="${target.id}"][data-field="${target.field}"]`,
      )
      ?.focus()
  })

  useEffect(() => {
    if (!confirmDiscard) return
    const timer = setTimeout(() => setConfirmDiscard(false), 3000)
    return () => clearTimeout(timer)
  }, [confirmDiscard])

  const summary = batch(drafts)
  const dupes = useMemo(() => duplicates(drafts, saved), [drafts, saved])

  function addRow(field: Field = 'description') {
    const draft = emptyDraft(`draft-${nextId.current++}`, drafts.at(-1))
    setDrafts([...drafts, draft])
    focusTarget.current = { id: draft.id, field }
  }

  function shownErrors(id: string): Errors {
    const draft = drafts.find((d) => d.id === id)
    // Blank rows are skipped on save, so they never complain
    if (!draft || isBlank(draft)) return {}
    const errors = validate(draft)
    return Object.fromEntries(
      Object.entries(errors).filter(
        ([field]) =>
          (attempted && !isBlank(draft)) || touched.has(`${id}:${field}`),
      ),
    )
  }

  function save() {
    if (!summary.filled.length) {
      setMessage('Nothing to save yet. Fill in a row first.')
      return
    }
    if (summary.invalid.length) {
      setAttempted(true)
      const first = summary.invalid[0]
      const errors = validate(first)
      focusTarget.current = {
        id: first.id,
        field: fields.find((f) => errors[f])!,
      }
      const n = summary.invalid.length
      setMessage(`Fix ${n} ${n === 1 ? 'row' : 'rows'} before saving.`)
      return
    }
    setSaving(true)
    setMessage('Saving…')
    // Stands in for the request that saves the whole batch at once
    setTimeout(() => {
      const added = summary.filled.map((d) =>
        toExpense(d, `exp-${nextId.current++}`),
      )
      setSaved((s) =>
        [...s, ...added].sort((a, b) => a.date.localeCompare(b.date)),
      )
      setDrafts([])
      setTouched(new Set())
      setAttempted(false)
      setSaving(false)
      setFresh(new Set(added.map((e) => e.id)))
      setTimeout(() => setFresh(new Set()), 1600)
      const n = added.length
      setMessage(`Saved ${n} ${n === 1 ? 'expense' : 'expenses'}.`)
    }, SAVE_DELAY)
  }

  function discard() {
    // Typed-in rows take two clicks to throw away; blank ones go at once
    if (summary.filled.length && !confirmDiscard) {
      setConfirmDiscard(true)
      return
    }
    setDrafts([])
    setTouched(new Set())
    setAttempted(false)
    setConfirmDiscard(false)
    setMessage('Draft rows discarded.')
  }

  const meta: DraftMeta = {
    shownErrors,
    duplicates: dupes,
    saving,
    update: (id, field, value) => {
      setDrafts((all) =>
        all.map((d) => (d.id === id ? { ...d, [field]: value } : d)),
      )
      setConfirmDiscard(false)
    },
    touch: (id, field) =>
      setTouched((t) =>
        t.has(`${id}:${field}`) ? t : new Set(t).add(`${id}:${field}`),
      ),
    remove: (id) => {
      const i = drafts.findIndex((d) => d.id === id)
      const rest = drafts.filter((d) => d.id !== id)
      setDrafts(rest)
      // Keep focus in the table: on the row that moved up, or the one above
      const neighbour = rest.at(i) ?? rest.at(i - 1)
      if (neighbour)
        focusTarget.current = { id: neighbour.id, field: 'description' }
      else root.current?.querySelector<HTMLElement>('[data-add-row]')?.focus()
    },
    next: (id, field) => {
      const i = drafts.findIndex((d) => d.id === id)
      if (i === drafts.length - 1) addRow(field)
      else focusTarget.current = { id: drafts[i + 1].id, field }
      // Leaving a field with Enter counts as leaving it; the re-render
      // also lets the effect move focus
      setTouched((t) => new Set(t).add(`${id}:${field}`))
    },
  }

  const rows: Row[] = [
    ...saved.map((expense) => ({
      kind: 'saved' as const,
      id: expense.id,
      expense,
    })),
    ...drafts.map((draft, i) => ({
      kind: 'draft' as const,
      id: draft.id,
      draft,
      number: i + 1,
    })),
  ]

  const savedTotal = saved.reduce((sum, e) => sum + e.amount, 0)
  const invalid = summary.invalid.length

  return (
    <div ref={root} className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm">
          <span className="font-medium">Expense report</span>{' '}
          <span className="text-muted-foreground">{periodLabel}</span>
        </p>
        <p className="text-sm text-muted-foreground tabular-nums">
          {saved.length} saved ·{' '}
          <span className="font-medium text-foreground">
            {money(savedTotal)}
          </span>
        </p>
      </div>

      <DraftRowsTable
        rows={rows}
        meta={meta}
        fresh={fresh}
        footer={
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Button
              data-add-row
              variant="ghost"
              size="sm"
              disabled={saving}
              onClick={() => addRow()}
            >
              <Plus /> Add row
            </Button>
            <span className="text-xs text-muted-foreground">
              Enter in a description or amount moves down a row, and adds one at
              the end.
            </span>
          </div>
        }
      />

      <div
        className={cn(
          'flex flex-wrap items-center justify-between gap-3 rounded-md border px-3 py-2',
          !drafts.length && 'border-dashed',
        )}
      >
        <div className="min-w-0 text-sm">
          {drafts.length ? (
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-medium">
                {summary.filled.length} new{' '}
                {summary.filled.length === 1 ? 'row' : 'rows'}
              </span>
              <span className="text-muted-foreground tabular-nums">
                {money(summary.total)}
              </span>
              {invalid ? (
                <span className="text-destructive">
                  · {invalid} {invalid === 1 ? 'needs' : 'need'} fixing
                </span>
              ) : null}
              {dupes.size ? (
                <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400">
                  <TriangleAlert aria-hidden className="size-3.5" />
                  {dupes.size} possible{' '}
                  {dupes.size === 1 ? 'duplicate' : 'duplicates'}
                </span>
              ) : null}
            </p>
          ) : (
            <p className="text-muted-foreground">
              No unsaved rows. Add some to start a batch.
            </p>
          )}
          <p
            aria-live="polite"
            className="text-xs text-muted-foreground empty:hidden"
          >
            {message}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={confirmDiscard ? 'destructive' : 'outline'}
            size="sm"
            disabled={!drafts.length || saving}
            onClick={discard}
          >
            {confirmDiscard
              ? `Discard ${summary.filled.length} ${summary.filled.length === 1 ? 'row' : 'rows'}?`
              : 'Discard'}
          </Button>
          <Button size="sm" disabled={!drafts.length || saving} onClick={save}>
            {saving ? (
              <LoaderCircle className="motion-safe:animate-spin" />
            ) : null}
            {saving
              ? 'Saving…'
              : summary.filled.length
                ? `Save ${summary.filled.length} ${summary.filled.length === 1 ? 'row' : 'rows'}`
                : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  )
}
