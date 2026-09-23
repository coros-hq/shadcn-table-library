'use client'

import { useState } from 'react'
import { Input } from '#/components/ui/input'
import { cn } from '#/lib/utils.ts'

interface EditableNumberCellProps {
  value: number
  onCommit: (value: number) => void
  /** Return an error message to block the commit, or null to accept it. */
  validate?: (value: number) => string | null
  suffix?: string
  label: string
  disabled?: boolean
}

export function EditableNumberCell({
  value,
  onCommit,
  validate,
  suffix,
  label,
  disabled,
}: EditableNumberCellProps) {
  const [draft, setDraft] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function commit() {
    if (draft === null) return
    const n = Number(draft)
    const message =
      draft.trim() === '' || !Number.isInteger(n) || n < 0
        ? 'Enter a whole number ≥ 0'
        : (validate?.(n) ?? null)

    // An invalid value keeps the input open so the user can fix it in place,
    // rather than silently snapping back to the old number.
    if (message) {
      setError(message)
      return
    }
    setDraft(null)
    setError(null)
    if (n !== value) onCommit(n)
  }

  function cancel() {
    setDraft(null)
    setError(null)
  }

  if (draft !== null) {
    return (
      <div className="w-24">
        <Input
          autoFocus
          type="number"
          inputMode="numeric"
          min={0}
          aria-label={label}
          aria-invalid={error ? true : undefined}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            setError(null)
          }}
          onBlur={() => (error ? cancel() : commit())}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') cancel()
          }}
          className="h-7 px-2 tabular-nums"
        />
        {error ? (
          <p role="alert" className="mt-1 text-xs text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={`Edit ${label}`}
      onClick={() => setDraft(String(value))}
      className={cn(
        '-mx-1.5 rounded border border-dashed border-transparent px-1.5 py-1 text-left tabular-nums',
        'hover:border-border hover:bg-muted focus-visible:border-ring focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-transparent disabled:hover:bg-transparent',
      )}
    >
      {value.toLocaleString()}
      {suffix ? <span className="text-muted-foreground"> {suffix}</span> : null}
    </button>
  )
}
