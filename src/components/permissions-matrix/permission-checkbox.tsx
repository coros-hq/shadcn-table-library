import { Checkbox } from '#/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/components/ui/tooltip'
import { cn } from '#/lib/utils'
import { describe } from './permissions'
import type { CellState, Summary } from './permissions'

// Inherited and locked grants read as "on, but not yours to change": a muted
// check instead of the solid one, so a glance at the matrix shows what this
// role adds on top of the role it inherits from.
const muted =
  'disabled:opacity-100 data-[state=checked]:border-transparent data-[state=checked]:bg-muted-foreground/25 data-[state=checked]:text-foreground data-[state=indeterminate]:border-transparent data-[state=indeterminate]:bg-muted-foreground/25 data-[state=indeterminate]:text-foreground dark:data-[state=checked]:bg-muted-foreground/30 dark:data-[state=indeterminate]:bg-muted-foreground/30'

export function PermissionCheckbox({
  state,
  label,
  changed,
  onChange,
}: {
  state: CellState
  /** e.g. "Edit Invoices" */
  label: string
  /** Differs from the last save */
  changed: boolean
  onChange: (on: boolean) => void
}) {
  if (state.kind === 'unavailable') {
    return (
      <span className="text-muted-foreground/50" title={describe(state)}>
        <span aria-hidden>–</span>
        <span className="sr-only">
          {label}: {describe(state)}
        </span>
      </span>
    )
  }

  const editable = state.kind === 'granted' || state.kind === 'denied'
  const checkbox = (
    <Checkbox
      checked={state.kind !== 'denied'}
      disabled={!editable}
      onCheckedChange={(checked) => onChange(checked === true)}
      aria-label={editable ? label : `${label}: ${describe(state)}`}
      className={cn(
        (state.kind === 'inherited' || state.kind === 'locked') && muted,
      )}
    />
  )

  return (
    <span className="relative inline-flex">
      {editable ? (
        checkbox
      ) : (
        // A disabled button gets no pointer events, so the tooltip hangs on a wrapper
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">{checkbox}</span>
          </TooltipTrigger>
          <TooltipContent>{describe(state)}</TooltipContent>
        </Tooltip>
      )}
      {changed ? (
        <span
          aria-hidden
          className="absolute -top-1 -right-1 size-1.5 rounded-full bg-amber-500"
        />
      ) : null}
    </span>
  )
}

export function SummaryCheckbox({
  summary,
  label,
  onChange,
}: {
  summary: Summary
  label: string
  onChange: (on: boolean) => void
}) {
  return (
    <Checkbox
      checked={summary.checked}
      disabled={!summary.enabled}
      onCheckedChange={() => onChange(summary.next)}
      aria-label={label}
      className={cn(!summary.enabled && muted)}
    />
  )
}
