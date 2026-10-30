import { CalendarDate } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'

export interface DateRangeValue {
  from?: Date
  to?: Date
}

/**
 * The calendar hands back local midnight for the picked day. Logs are shown
 * in UTC, so read the picked calendar date as a UTC day rather than shifting
 * it by the viewer's offset.
 */
export function utcDayStart(date: Date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
}

/** A local date that shows the given UTC day */
export function calendarDate(timestamp: number) {
  const d = new Date(timestamp)
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}

// The calendar speaks @internationalized/date; the filter stores plain Dates
export const toCalendarDate = (date?: Date) =>
  date
    ? new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
    : undefined

export const fromCalendarDate = (value?: DateValue) =>
  value ? new Date(value.year, value.month - 1, value.day) : undefined
