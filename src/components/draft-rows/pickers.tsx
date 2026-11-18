import { useState } from 'react'
import { CalendarIcon } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Calendar } from '#/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { cn } from '#/lib/utils'
import { categories, period, today } from './data'
import { formatDate } from './drafts'

/** What a draft cell hands its control: focus hooks and error wiring */
export interface ControlProps {
  'data-draft': string
  'data-field': string
  'aria-invalid': boolean
  'aria-describedby': string | undefined
  disabled: boolean
}

// Dates stay "2026-11-12" strings; the calendar wants local Date objects
const toDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}
const toIso = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')

const first = toDate(period.from)
const last = toDate(today)

export function DateField({
  value,
  label,
  control,
  onChange,
  onClose,
}: {
  value: string
  /** "Date, new row 2" */
  label: string
  control: ControlProps
  onChange: (iso: string) => void
  /** Closing the picker counts as leaving the field */
  onClose: () => void
}) {
  const [open, setOpen] = useState(false)
  const selected = value ? toDate(value) : undefined

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) onClose()
      }}
    >
      <PopoverTrigger asChild>
        <Button
          {...control}
          variant="outline"
          size="sm"
          aria-label={`${label}: ${value ? formatDate(value) : 'not set'}`}
          className={cn(
            'h-8 w-28 justify-start px-2 font-normal tabular-nums',
            'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
            !value && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className="text-muted-foreground" />
          {value ? formatDate(value) : 'Pick a date'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          autoFocus
          selected={selected}
          defaultMonth={selected ?? first}
          // The report covers November up to today, nothing else
          startMonth={first}
          endMonth={toDate(period.to)}
          disabled={[{ before: first }, { after: last }]}
          today={last}
          onSelect={(date) => {
            if (!date) return
            onChange(toIso(date))
            setOpen(false)
            onClose()
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

export function CategoryField({
  value,
  label,
  control,
  onChange,
  onClose,
}: {
  value: string
  label: string
  control: ControlProps
  onChange: (category: string) => void
  onClose: () => void
}) {
  return (
    <Select
      value={value}
      onValueChange={onChange}
      // Blur fires when the list opens, so touch the field when it closes
      onOpenChange={(open) => !open && onClose()}
      disabled={control.disabled}
    >
      <SelectTrigger {...control} size="sm" aria-label={label} className="w-32">
        <SelectValue placeholder="Choose…" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((c) => (
          <SelectItem key={c} value={c}>
            {c}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
