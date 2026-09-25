'use client'

import { useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import type { Column } from '@tanstack/react-table'
import type { DateRange } from 'react-day-picker'

import { Button } from '#/components/ui/button'
import { Calendar } from '#/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'
import { cn } from '#/lib/utils.ts'
import { NOW, formatDay } from './data'

const DAY = 86_400_000

/**
 * The calendar hands back local midnight for the picked day. Logs are shown
 * in UTC, so read the picked calendar date as a UTC day rather than shifting
 * it by the viewer's offset.
 */
export function utcDayStart(date: Date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
}

/** The calendar works in local dates; build one that shows the given UTC day */
function calendarDate(timestamp: number) {
  const d = new Date(timestamp)
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}

function formatRange(from: Date, to: Date) {
  const start = formatDay(utcDayStart(from))
  const end = formatDay(utcDayStart(to))
  return start === end ? start : `${start} – ${end}`
}

const presets = [
  { label: 'Today', days: 1 },
  { label: 'Last 3 days', days: 3 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 14 days', days: 14 },
]

interface DateRangeFilterProps<TData> {
  column: Column<TData> | undefined
}

export function DateRangeFilter<TData>({
  column,
}: DateRangeFilterProps<TData>) {
  const value = column?.getFilterValue() as DateRange | undefined
  const [open, setOpen] = useState(false)
  // The range being picked; it only becomes the filter once both ends are set
  const [draft, setDraft] = useState<DateRange | undefined>(value)
  const today = calendarDate(NOW)

  function apply(range: DateRange | undefined) {
    column?.setFilterValue(range)
    setDraft(range)
    setOpen(false)
  }

  // react-day-picker's own range logic turns the first click into a one-day
  // range and later clicks only move an end, so a new range can never be
  // started. Pick start, then end, explicitly instead.
  function pickDay(day: Date) {
    if (!draft?.from || draft.to) {
      setDraft({ from: day, to: undefined })
      return
    }
    apply(
      day < draft.from
        ? { from: day, to: draft.from }
        : { from: draft.from, to: day },
    )
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        // Reopening shows the applied range, not a half-picked leftover
        if (next) setDraft(value)
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('h-8 font-normal', !value && 'border-dashed')}
        >
          <CalendarIcon className="size-3.5" />
          {value?.from && value.to
            ? formatRange(value.from, value.to)
            : 'Date range'}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="flex w-auto flex-col p-0 sm:flex-row"
        align="end"
      >
        <div className="flex flex-wrap gap-0.5 border-b p-2 sm:w-32 sm:flex-col sm:border-r sm:border-b-0">
          {presets.map((preset) => (
            <Button
              key={preset.label}
              variant="ghost"
              size="sm"
              className="justify-start font-normal"
              onClick={() =>
                apply({
                  from: calendarDate(NOW - (preset.days - 1) * DAY),
                  to: today,
                })
              }
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <div>
          <Calendar
            mode="range"
            numberOfMonths={2}
            defaultMonth={calendarDate(NOW - 30 * DAY)}
            selected={draft}
            onSelect={(_, day) => pickDay(day)}
            today={today}
            disabled={{ after: today }}
          />
          <div className="flex items-center gap-2 border-t px-3 py-2">
            <p className="text-sm text-muted-foreground tabular-nums">
              {!draft?.from
                ? 'Pick a start date'
                : !draft.to
                  ? `${formatDay(utcDayStart(draft.from))} – pick an end date`
                  : formatRange(draft.from, draft.to)}
            </p>
            {value && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto h-7 font-normal"
                onClick={() => apply(undefined)}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
