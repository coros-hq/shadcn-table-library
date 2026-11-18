import { useMemo, useState } from 'react'
import { CircleAlert, CircleCheck } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { days, draft, people, shiftById, shifts, weekLabel } from './data'
import type { Schedule } from './data'
import { ScheduleTable } from './data-table'
import { assign, changes, conflicts, gaps, load } from './schedule'
import { ShiftChip } from './shift-cell'

export function ScheduleMatrixDemo() {
  const [published, setPublished] = useState<Schedule>(draft)
  const [schedule, setSchedule] = useState<Schedule>(draft)

  const changed = useMemo(
    () => changes(published, schedule),
    [published, schedule],
  )

  const issues = useMemo(() => {
    const name = (id: string) =>
      people.find((p) => p.id === id)!.name.split(' ')[0]
    return [
      ...gaps(schedule).map(
        (g) =>
          `${days[g.day].short} ${shiftById[g.shift].label.toLowerCase()}: ${g.have} of ${g.need} staffed`,
      ),
      ...conflicts(schedule).map(
        (c) =>
          `${name(c.personId)} has ${c.rest}h rest before ${days[c.day].short}`,
      ),
      ...people
        .map((p) => ({ p, ...load(p, schedule[p.id]) }))
        .filter((l) => l.status === 'over')
        .map((l) => `${l.p.name.split(' ')[0]} is ${l.diff}h over contract`),
    ]
  }, [schedule])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div className="space-y-0.5">
          <p className="text-sm font-medium">Ward 4B · {weekLabel}</p>
          <p className="text-xs text-muted-foreground">
            Click a cell to pick a shift, or move with the arrow keys and type
            its letter.
          </p>
        </div>
        <ul
          aria-label="Shifts"
          className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground"
        >
          {shifts.map((s) => (
            <li key={s.id} className="flex items-center gap-1.5">
              <ShiftChip shift={s.id} />
              <span>
                <span className="text-foreground">{s.label}</span>{' '}
                {s.id === 'leave' ? '' : s.time}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <ScheduleTable
        schedule={schedule}
        changed={changed}
        assign={(personId, day, value) =>
          setSchedule((current) => assign(current, personId, day, value))
        }
      />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div aria-live="polite" className="min-w-0 text-sm">
          {issues.length ? (
            <details className="group">
              <summary className="flex cursor-pointer items-center gap-1.5 rounded-sm font-medium text-destructive outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
                <CircleAlert className="size-4" />
                {issues.length} {issues.length === 1 ? 'problem' : 'problems'}{' '}
                to fix
              </summary>
              <ul className="mt-1.5 ml-5.5 list-disc space-y-0.5 text-muted-foreground">
                {issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            </details>
          ) : (
            <p className="flex items-center gap-1.5 text-muted-foreground">
              <CircleCheck className="size-4 text-emerald-600" />
              Every shift covered, everyone rested
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-sm whitespace-nowrap tabular-nums',
              changed.size ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            {changed.size
              ? `${changed.size} unpublished change${changed.size === 1 ? '' : 's'}`
              : 'Published'}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!changed.size}
            onClick={() => setSchedule(published)}
          >
            Discard
          </Button>
          <Button
            size="sm"
            disabled={!changed.size}
            onClick={() => setPublished(schedule)}
          >
            Publish
          </Button>
        </div>
      </div>
    </div>
  )
}
