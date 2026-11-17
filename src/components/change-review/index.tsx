import { useState } from 'react'
import { CircleCheck, FileDiff } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { changes, rows, unchanged } from './data'
import { CatalogTable } from './data-table'
import { DiffPanel } from './diff-panel'
import { rowInView } from './columns'
import {
  WHOLE,
  apply,
  changeKey,
  decide,
  keysOf,
  rowState,
  tally,
} from './diff'
import type { Decision, Decisions, View } from './diff'

const views: { id: View; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'review', label: 'To review' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'rejected', label: 'Rejected' },
]

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

// The order the panel steps through: products with changes, as the table lists them
const reviewOrder = rows.filter((r) => r.change).map((r) => r.id)
const changeById = new Map(changes.map((c) => [c.id, c]))

const needsReview = (id: string, decisions: Decisions) => {
  const state = rowState(changeById.get(id)!, decisions)
  return state === 'pending' || state === 'partial'
}

/** The next product still to review after `from`, wrapping around */
function nextToReview(from: string | null, decisions: Decisions) {
  const start = from ? reviewOrder.indexOf(from) : -1
  for (let i = 1; i <= reviewOrder.length; i++) {
    const id = reviewOrder[(start + i) % reviewOrder.length]
    if (needsReview(id, decisions)) return id
  }
  return null
}

/** What applying would do, record by record */
function summarize(decisions: Decisions) {
  const accepted = (k: string) => decisions[k] === 'accepted'
  return {
    changes: tally(changes, decisions).accepted,
    updated: changes.filter(
      (c) => c.kind === 'update' && keysOf(c).some(accepted),
    ).length,
    added: changes.filter(
      (c) => c.kind === 'create' && accepted(changeKey(c.id, WHOLE)),
    ).length,
    removed: changes.filter(
      (c) => c.kind === 'delete' && accepted(changeKey(c.id, WHOLE)),
    ).length,
    catalog: unchanged.length + apply(changes, decisions).length,
  }
}

export function ChangeReviewDemo() {
  const [decisions, setDecisions] = useState<Decisions>({})
  const [view, setView] = useState<View>('all')
  const [openId, setOpenId] = useState<string | null>(null)
  const [applied, setApplied] = useState<Decisions | null>(null)

  const counts = tally(changes, decisions)
  const rowCount = (v: View) =>
    rows.filter((r) => r.change && rowInView(r, decisions, v)).length
  const pendingKeys = changes.flatMap(keysOf).filter((k) => !(k in decisions))

  function decideKeys(
    keys: string[],
    decision: Decision | null,
    advance = false,
  ) {
    const next = decide(decisions, keys, decision)
    setDecisions(next)
    // After a decision in the panel, go straight to the next product to review
    if (advance) setOpenId(nextToReview(openId, next))
  }

  const step = (by: 1 | -1) => {
    const i = openId ? reviewOrder.indexOf(openId) : -1
    setOpenId(reviewOrder[(i + by + reviewOrder.length) % reviewOrder.length])
  }

  if (applied) {
    const result = summarize(applied)
    return (
      <div className="flex flex-col items-start gap-3 rounded-md border p-6">
        <CircleCheck className="size-6 text-emerald-600" />
        <div>
          <p className="font-medium">
            Applied {plural(result.changes, 'change')}
          </p>
          <p className="text-sm text-muted-foreground">
            {plural(result.updated, 'product')} updated, {result.added} added,{' '}
            {result.removed} removed. The catalog now has{' '}
            {plural(result.catalog, 'product')}. Rejected and pending changes
            were left out.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setApplied(null)
            setDecisions({})
            setView('all')
          }}
        >
          Start over
        </Button>
      </div>
    )
  }

  const openChange = openId ? (changeById.get(openId) ?? null) : null
  const toReview = rowCount('review')

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <FileDiff className="size-4 text-muted-foreground" />
          <span className="font-medium">Supplier price list + stocktake</span>
          <span className="text-muted-foreground">
            touches {plural(changes.length, 'product')} of {rows.length}
          </span>
        </p>
        <Button
          size="sm"
          disabled={toReview === 0}
          onClick={() => setOpenId(nextToReview(null, decisions))}
        >
          {toReview ? `Review ${plural(toReview, 'product')}` : 'All reviewed'}
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          role="group"
          aria-label="Show rows"
          className="inline-flex rounded-md border p-0.5"
        >
          {views.map((v) => (
            <button
              key={v.id}
              type="button"
              aria-pressed={view === v.id}
              onClick={() => setView(v.id)}
              className="flex h-7 items-center gap-1.5 rounded px-2.5 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:bg-muted aria-pressed:text-foreground"
            >
              {v.label}
              <span className="text-xs tabular-nums">
                {v.id === 'all' ? rows.length : rowCount(v.id)}
              </span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={!pendingKeys.length}
            onClick={() => decideKeys(pendingKeys, 'rejected')}
          >
            Reject the rest
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!pendingKeys.length}
            onClick={() => decideKeys(pendingKeys, 'accepted')}
          >
            Accept the rest
          </Button>
        </div>
      </div>

      {/* The table scrolls inside this frame, and the panel opens at its right,
          pushing the table aside. The panel is never taller than the frame, so
          its buttons are always in view. */}
      <div className="relative flex overflow-hidden rounded-md border">
        <CatalogTable
          rows={rows}
          view={view}
          openId={openId}
          meta={{ decisions, open: setOpenId }}
        />
        <DiffPanel
          change={openChange}
          position={{
            index: openId ? reviewOrder.indexOf(openId) : 0,
            total: reviewOrder.length,
          }}
          decisions={decisions}
          onDecide={decideKeys}
          onPrevious={() => step(-1)}
          onNext={() => step(1)}
          onClose={() => setOpenId(null)}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="text-sm text-muted-foreground">
          <span className="text-emerald-700 dark:text-emerald-400">
            {counts.accepted} accepted
          </span>
          {' · '}
          <span className={cn(counts.rejected > 0 && 'text-destructive')}>
            {counts.rejected} rejected
          </span>
          {' · '}
          {counts.pending} to review
        </p>
        <Button
          size="sm"
          variant={counts.pending ? 'outline' : 'default'}
          disabled={counts.accepted === 0}
          onClick={() => setApplied(decisions)}
        >
          Apply {plural(counts.accepted, 'change')}
        </Button>
      </div>
    </div>
  )
}
