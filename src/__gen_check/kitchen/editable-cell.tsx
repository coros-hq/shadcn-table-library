'use client'

import { useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { CellContext } from '@tanstack/react-table'

import { Checkbox } from '#/components/ui/checkbox'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '#/components/ui/select'

// Inline cell editing. A cell edits in place and saves through
// `table.options.meta.updateCell`, which the data table provides. Values are
// checked against the column's rules before they are saved.

export interface Rules {
  required?: boolean
  /** The smallest number, or the shortest text */
  min?: number
  /** The largest number, or the longest text */
  max?: number
  /** Numbers only: no decimals */
  integer?: boolean
}

export interface EditField {
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox'
  options?: string[]
  rules?: Rules
}

/** What the data table puts in `meta` so cells can save */
export interface EditMeta {
  updateCell: (rowId: string, columnId: string, value: unknown) => void
}

/** The error message for a typed value, or null when it can be saved */
export function validate(raw: string, field: EditField): string | null {
  const rules = field.rules ?? {}
  const value = raw.trim()

  if (field.type === 'number') {
    const n = Number(value)
    if (value === '' || Number.isNaN(n)) return 'Enter a number'
    if (rules.integer && !Number.isInteger(n)) return 'Enter a whole number'
    if (rules.min !== undefined && n < rules.min) {
      return `Must be ${rules.min} or more`
    }
    if (rules.max !== undefined && n > rules.max) {
      return `Must be ${rules.max} or less`
    }
    return null
  }

  if (rules.required && value === '') return 'Required'

  if (field.type === 'date') {
    if (value !== '' && Number.isNaN(Date.parse(`${value}T00:00:00Z`))) {
      return 'Enter a valid date'
    }
    return null
  }

  if (field.type === 'text' && value !== '') {
    if (rules.min !== undefined && value.length < rules.min) {
      return `At least ${rules.min} characters`
    }
    if (rules.max !== undefined && value.length > rules.max) {
      return `At most ${rules.max} characters`
    }
  }
  return null
}

/** Turns typed text into the value stored on the row */
export function parse(raw: string, field: EditField): unknown {
  return field.type === 'number' ? Number(raw.trim()) : raw.trim()
}

export function EditableCell<TData>({
  context,
  field,
  children,
}: {
  context: CellContext<TData, unknown>
  field: EditField
  /** How the value reads when it isn't being edited */
  children?: ReactNode
}) {
  const { row, column, table } = context
  const value = context.getValue()
  const save = (next: unknown) =>
    (table.options.meta as EditMeta | undefined)?.updateCell(
      row.id,
      column.id,
      next,
    )
  const label =
    typeof column.columnDef.header === 'string'
      ? column.columnDef.header
      : column.id

  // Checkboxes and selects are already one-step controls, so they edit
  // directly instead of through a text input
  if (field.type === 'checkbox') {
    return (
      <Checkbox
        checked={value === true}
        onCheckedChange={(checked) => save(checked === true)}
        aria-label={label}
      />
    )
  }

  if (field.type === 'select') {
    return (
      <Select value={String(value ?? '')} onValueChange={save}>
        <SelectTrigger
          size="sm"
          aria-label={label}
          // The chevron only shows when the cell is hovered, focused or open
          className="h-7 border-transparent px-1 shadow-none hover:border-input focus-visible:[&>svg]:opacity-50 data-[state=open]:[&>svg]:opacity-50 dark:bg-transparent [&>svg]:opacity-0 hover:[&>svg]:opacity-50"
        >
          {children ?? String(value ?? '')}
        </SelectTrigger>
        <SelectContent>
          {(field.options ?? []).map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  return (
    <TextEditor value={value} field={field} label={label} onSave={save}>
      {children ?? String(value ?? '')}
    </TextEditor>
  )
}

function TextEditor({
  value,
  field,
  label,
  onSave,
  children,
}: {
  value: unknown
  field: EditField
  label: string
  onSave: (value: unknown) => void
  children: ReactNode
}) {
  const [draft, setDraft] = useState<string | null>(null)
  // Enter and Escape close the editor, and the input losing focus as it
  // unmounts must not save a second time
  const closed = useRef(false)
  const errorId = useId()
  const editing = draft !== null
  const error = editing ? validate(draft, field) : null

  function open() {
    closed.current = false
    setDraft(String(value ?? ''))
  }

  function cancel() {
    closed.current = true
    setDraft(null)
  }

  function commit() {
    if (draft === null || closed.current) return
    closed.current = true
    // An invalid value is never saved: Enter keeps the editor open with the
    // message, leaving the cell (blur) gives up and keeps the old value
    if (!error) {
      const next = parse(draft, field)
      if (next !== value) onSave(next)
    }
    setDraft(null)
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={open}
        aria-label={`Edit ${label}`}
        className="-mx-1.5 min-h-7 w-[calc(100%+0.75rem)] cursor-text rounded px-1.5 py-1 [text-align:inherit] hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        {children}
      </button>
    )
  }

  return (
    <div className="-mx-1.5 space-y-1">
      <Input
        autoFocus
        type={field.type === 'text' ? 'text' : field.type}
        value={draft}
        aria-label={label}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !error) commit()
          if (e.key === 'Escape') cancel()
        }}
        className="h-7 min-w-24 px-1.5"
      />
      {error ? (
        <p id={errorId} className="text-left text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
