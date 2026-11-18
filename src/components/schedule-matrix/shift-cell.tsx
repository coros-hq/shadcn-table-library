import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Check, TriangleAlert } from 'lucide-react'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'
import { cn } from '#/lib/utils'
import { shiftById, shifts } from './data'
import type { Assignment, ShiftId } from './data'

export const shiftTone: Record<ShiftId, string> = {
  early: 'bg-sky-100 text-sky-900 dark:bg-sky-500/20 dark:text-sky-200',
  late: 'bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200',
  night:
    'bg-violet-100 text-violet-900 dark:bg-violet-500/25 dark:text-violet-200',
  leave:
    'bg-[repeating-linear-gradient(135deg,var(--muted)_0_4px,transparent_4px_8px)] text-muted-foreground',
}

/** A shift's letter in its color, as in the cells and the legend */
export function ShiftChip({
  shift,
  className,
}: {
  shift: ShiftId
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex size-5 shrink-0 items-center justify-center rounded text-[11px] font-semibold',
        shiftTone[shift],
        className,
      )}
    >
      {shiftById[shift].code}
    </span>
  )
}

const options: { value: Assignment; label: string; time: string }[] = [
  ...shifts.map((s) => ({ value: s.id, label: s.label, time: s.time })),
  { value: null, label: 'Off', time: 'Not working' },
]

export function ShiftCell({
  cellKey,
  value,
  label,
  changed,
  rest,
  tabbable,
  onAssign,
  onKeyDown,
}: {
  /** Lets the table find this cell to move focus to it */
  cellKey: string
  value: Assignment
  /** Who and which day, for screen readers: "Tom Becker, Wed 25" */
  label: string
  changed: boolean
  /** Hours of rest before this shift when it's too few, otherwise null */
  rest: number | null
  /** Roving tabindex: only the grid's current cell is in the tab order */
  tabbable: boolean
  onAssign: (value: Assignment) => void
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void
}) {
  const [open, setOpen] = useState(false)
  const shift = value ? shiftById[value] : null

  const description = [
    shift ? `${shift.label}, ${shift.time}` : 'Off',
    rest !== null ? `only ${rest}h rest after the previous shift` : null,
    changed ? 'changed' : null,
  ]
    .filter(Boolean)
    .join('; ')

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-cell={cellKey}
          tabIndex={tabbable ? 0 : -1}
          aria-label={`${label}: ${description}`}
          title={
            rest !== null
              ? `Only ${rest}h rest since the previous shift (11h minimum)`
              : undefined
          }
          onKeyDown={onKeyDown}
          className={cn(
            'group/cell relative flex h-11 w-full min-w-14 items-center justify-center rounded-md text-xs font-semibold outline-none',
            'focus-visible:ring-[3px] focus-visible:ring-ring/60',
            shift
              ? shiftTone[shift.id]
              : 'text-muted-foreground/40 hover:bg-muted hover:text-muted-foreground',
            rest !== null && 'ring-2 ring-destructive ring-inset',
          )}
        >
          {shift ? (
            shift.code
          ) : (
            <span aria-hidden className="group-hover/cell:hidden">
              –
            </span>
          )}
          {shift ? null : (
            <span aria-hidden className="hidden group-hover/cell:inline">
              +
            </span>
          )}
          {rest !== null ? (
            <TriangleAlert
              aria-hidden
              className="absolute top-1 left-1 size-3 text-destructive"
            />
          ) : null}
          {changed ? (
            <span
              aria-hidden
              className="absolute top-1 right-1 size-1.5 rounded-full bg-blue-500"
            />
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        className="w-56 p-1"
        aria-label={`Shift for ${label}`}
        onOpenAutoFocus={(event) => {
          // Start on the current choice rather than the first one
          event.preventDefault()
          const current = (
            event.currentTarget as HTMLElement | null
          )?.querySelector<HTMLElement>('[aria-pressed="true"]')
          current?.focus()
        }}
        onKeyDown={(event) => {
          if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
          event.preventDefault()
          const items = [
            ...event.currentTarget.querySelectorAll<HTMLElement>('button'),
          ]
          const i = items.indexOf(document.activeElement as HTMLElement)
          const next = event.key === 'ArrowDown' ? i + 1 : i - 1
          items[(next + items.length) % items.length]?.focus()
        }}
      >
        <p className="px-2 pt-1 pb-1.5 text-xs text-muted-foreground">
          {label}
        </p>
        {options.map((option) => (
          <button
            key={option.label}
            type="button"
            aria-pressed={option.value === value}
            onClick={() => {
              onAssign(option.value)
              setOpen(false)
            }}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none hover:bg-accent focus-visible:bg-accent"
          >
            {option.value ? (
              <ShiftChip shift={option.value} />
            ) : (
              <span
                aria-hidden
                className="inline-flex size-5 items-center justify-center rounded border border-dashed text-[11px] text-muted-foreground"
              >
                –
              </span>
            )}
            <span className="flex-1">{option.label}</span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {option.time}
            </span>
            <Check
              aria-hidden
              className={cn(
                'size-4',
                option.value === value ? 'opacity-100' : 'opacity-0',
              )}
            />
          </button>
        ))}
        <p className="mt-1 border-t px-2 pt-1.5 pb-1 text-xs text-muted-foreground">
          Or type E, L, N, A on a cell. Delete clears it.
        </p>
      </PopoverContent>
    </Popover>
  )
}
