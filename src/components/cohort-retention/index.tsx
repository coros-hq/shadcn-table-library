import { useState } from 'react'
import { X } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { compare } from './cohorts'
import type { Mode } from './cohorts'
import { cohorts } from './data'
import { hatch } from './columns'
import { CohortTable } from './data-table'

const modes: { id: Mode; label: string }[] = [
  { id: 'percent', label: 'Percent' },
  { id: 'count', label: 'Users' },
]

export function CohortRetentionDemo() {
  const [mode, setMode] = useState<Mode>('percent')
  const [highlighted, setHighlighted] = useState<string | null>(null)

  const cohort = cohorts.find((c) => c.id === highlighted)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div
          role="group"
          aria-label="Show retention as"
          className="inline-flex rounded-md border p-0.5"
        >
          {modes.map((m) => (
            <button
              key={m.id}
              type="button"
              aria-pressed={mode === m.id}
              onClick={() => setMode(m.id)}
              className="flex h-7 items-center rounded px-2.5 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:bg-muted aria-pressed:text-foreground"
            >
              {m.label}
            </button>
          ))}
        </div>
        <Legend />
      </div>

      <CohortTable
        mode={mode}
        highlighted={highlighted}
        toggle={(id) => setHighlighted((h) => (h === id ? null : id))}
      />

      <div className="flex min-h-9 items-center justify-between gap-3 rounded-md bg-muted/50 px-3 py-1.5">
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {cohort
            ? compare(cohort, cohorts)
            : 'Pick a cohort to highlight it and compare it with the average.'}
        </p>
        {cohort ? (
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0"
            aria-label="Clear highlight"
            onClick={() => {
              setHighlighted(null)
              document
                .querySelector<HTMLElement>(`[data-cohort="${cohort.id}"]`)
                ?.focus()
            }}
          >
            <X />
          </Button>
        ) : null}
      </div>
    </div>
  )
}

function Legend() {
  return (
    <ul
      aria-label="Legend"
      className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground [--cohort:var(--color-blue-600)] dark:[--cohort:var(--color-blue-500)]"
    >
      <li className="flex items-center gap-1.5">
        <span>0%</span>
        <span
          aria-hidden
          className="h-2.5 w-20 rounded-sm bg-[linear-gradient(to_right,transparent,var(--cohort))] shadow-[inset_0_0_0_1px_var(--border)]"
        />
        <span>60%+ retained</span>
      </li>
      <li className="flex items-center gap-1.5">
        <span
          aria-hidden
          className="size-3 rounded-sm shadow-[inset_0_0_0_1px_var(--border)]"
        />
        Zero: nobody came back
      </li>
      <li className="flex items-center gap-1.5">
        <span aria-hidden className={cn('size-3 rounded-sm', hatch)} />
        Not reached yet
      </li>
    </ul>
  )
}
