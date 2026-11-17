import { useState } from 'react'
import { CircleAlert, Copy } from 'lucide-react'

import { Input } from '#/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/components/ui/tooltip'
import { cn } from '#/lib/utils'
import type { Issue } from './review'

// A cell of a mapped column. Problems are shown in place, and clicking the
// cell opens an input to fix the value. Any value is accepted on commit: the
// review runs again and the highlight goes away once the value is valid.
export function ReviewCell({
  value,
  issue,
  label,
  onCommit,
}: {
  value: string
  issue?: Issue
  /** e.g. "Email, line 4" */
  label: string
  onCommit: (value: string) => void
}) {
  const [draft, setDraft] = useState<string | null>(null)

  if (draft !== null) {
    const done = (save: boolean) => {
      if (save && draft !== value) onCommit(draft)
      setDraft(null)
    }
    return (
      <Input
        autoFocus
        value={draft}
        aria-label={label}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => done(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') done(true)
          if (e.key === 'Escape') done(false)
        }}
        className="h-8 min-w-32"
      />
    )
  }

  const button = (
    <button
      type="button"
      onClick={() => setDraft(value)}
      aria-label={`${label}: ${value || 'empty'}${issue ? `. ${issue.message}` : ''}. Edit`}
      className={cn(
        'flex h-8 w-full min-w-24 items-center gap-1.5 rounded-md px-2 text-left outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50',
        issue?.kind === 'invalid' &&
          'bg-destructive/10 text-destructive ring-1 ring-destructive/30 ring-inset hover:bg-destructive/15',
        issue?.kind === 'duplicate' &&
          'bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/40 ring-inset hover:bg-amber-500/15 dark:text-amber-400',
      )}
    >
      <span className={cn('truncate', !value && 'italic opacity-70')}>
        {value || 'Empty'}
      </span>
      {issue ? (
        issue.kind === 'invalid' ? (
          <CircleAlert className="ml-auto size-3.5 shrink-0" />
        ) : (
          <Copy className="ml-auto size-3.5 shrink-0" />
        )
      ) : null}
    </button>
  )

  if (!issue) return button
  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>{issue.message}</TooltipContent>
    </Tooltip>
  )
}
