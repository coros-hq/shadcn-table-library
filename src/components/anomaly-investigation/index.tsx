import { useMemo, useState } from 'react'
import { CheckCheck } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Label } from '#/components/ui/label'
import { Switch } from '#/components/ui/switch'
import { inView, kindOf, views } from './anomalies'
import type { View } from './anomalies'
import { metrics as businessMetrics } from './data'
import type { Metric } from './data'
import { AnomalyTable } from './data-table'

/**
 * The investigation view for any set of metrics. On its own it shows the
 * business example; the finance example passes its own numbers in.
 */
export function AnomalyInvestigationDemo({
  metrics = businessMetrics,
}: {
  metrics?: Metric[]
}) {
  const [view, setView] = useState<View>('anomalies')
  const [hideReviewed, setHideReviewed] = useState(false)
  const [reviewed, setReviewed] = useState<Set<string>>(new Set())

  const shown = useMemo(
    () =>
      metrics.filter(
        (m) => inView(m, view) && !(hideReviewed && reviewed.has(m.id)),
      ),
    [metrics, view, hideReviewed, reviewed],
  )

  const flagged = metrics.filter((m) => kindOf(m.today) !== 'normal')
  const open = flagged.filter((m) => !reviewed.has(m.id))
  const shownOpen = shown.filter(
    (m) => kindOf(m.today) !== 'normal' && !reviewed.has(m.id),
  )

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div
          role="group"
          aria-label="Show"
          className="inline-flex max-w-full overflow-x-auto rounded-md border p-0.5"
        >
          {views.map((v) => (
            <button
              key={v.id}
              type="button"
              aria-pressed={view === v.id}
              onClick={() => setView(v.id)}
              className="flex h-7 items-center gap-1.5 rounded px-2.5 text-sm whitespace-nowrap text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:bg-muted aria-pressed:text-foreground"
            >
              {v.label}
              <span className="text-xs tabular-nums">
                {metrics.filter((m) => inView(m, v.id)).length}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="hide-reviewed"
            checked={hideReviewed}
            onCheckedChange={setHideReviewed}
          />
          <Label htmlFor="hide-reviewed" className="font-normal">
            Hide reviewed
          </Label>
        </div>
      </div>

      <AnomalyTable
        metrics={shown}
        meta={{
          reviewed,
          toggleReviewed: (id) =>
            setReviewed((r) => {
              const next = new Set(r)
              if (next.has(id)) next.delete(id)
              else next.add(id)
              return next
            }),
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted/50 px-3 py-1.5">
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {open.length
            ? `${open.length} of ${flagged.length} anomalies left to review today.`
            : `All ${flagged.length} anomalies reviewed.`}
        </p>
        <Button
          variant="ghost"
          size="sm"
          disabled={!shownOpen.length}
          onClick={() =>
            setReviewed((r) => new Set([...r, ...shownOpen.map((m) => m.id)]))
          }
        >
          <CheckCheck />
          {shownOpen.length
            ? `Mark ${shownOpen.length} shown reviewed`
            : 'All shown reviewed'}
        </Button>
      </div>
    </div>
  )
}
