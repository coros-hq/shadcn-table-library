<script setup lang="ts">
import { format } from 'date-fns'
import { CalendarDate, getLocalTimeZone } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
import { CalendarIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { RangeCalendar } from '@/components/ui/range-calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import type { DateRangeValue } from './types'

defineProps<{ label: string }>()

const value = defineModel<DateRangeValue | undefined>('value')

// The calendar speaks @internationalized/date; the filter value stores plain Dates
const toCalendarDate = (date?: Date) =>
  date
    ? new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
    : undefined
const toDate = (date?: DateValue) => date?.toDate(getLocalTimeZone())

function onSelect(range: { start?: DateValue; end?: DateValue }) {
  const from = toDate(range.start)
  const to = toDate(range.end)
  value.value = from || to ? { from, to } : undefined
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button variant="outline" size="sm">
        <CalendarIcon class="mr-2 h-4 w-4" />
        <template v-if="value?.from">
          {{ format(value.from, 'MMM d') }}
          <template v-if="value.to"> – {{ format(value.to, 'MMM d') }}</template>
        </template>
        <template v-else>{{ label }}</template>
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0" align="start">
      <RangeCalendar
        :number-of-months="2"
        :default-placeholder="toCalendarDate(value?.from)"
        :model-value="{
          start: toCalendarDate(value?.from),
          end: toCalendarDate(value?.to),
        }"
        @update:model-value="onSelect"
      />
    </PopoverContent>
  </Popover>
</template>
