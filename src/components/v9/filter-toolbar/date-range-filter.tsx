'use client'

import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

import type { DateRange } from 'react-day-picker'

import { Button } from '#/components/ui/button'
import { Calendar } from '#/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'

export interface DateRangeFilterProps {
  label: string
  value: DateRange | undefined
  onChange: (value: DateRange | undefined) => void
}

export function DateRangeFilter({
  label,
  value,
  onChange,
}: DateRangeFilterProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value?.from ? (
            value.to ? (
              <>
                {format(value.from, 'MMM d')} – {format(value.to, 'MMM d')}
              </>
            ) : (
              format(value.from, 'MMM d')
            )
          ) : (
            label
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={value?.from}
          selected={value}
          onSelect={onChange}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  )
}
