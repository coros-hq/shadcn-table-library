<script setup lang="ts" generic="TData">
import { computed, ref } from 'vue'
import { CalendarIcon } from '@lucide/vue'
import type { Column } from '@tanstack/vue-table'
import type { DateValue } from '@internationalized/date'

import { Button } from '@/components/ui/button'
import { RangeCalendar } from '@/components/ui/range-calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { NOW, formatDay } from './data'
import {
  calendarDate,
  fromCalendarDate,
  toCalendarDate,
  utcDayStart,
} from './date-range'
import type { DateRangeValue } from './date-range'

const DAY = 86_400_000

const presets = [
  { label: 'Today', days: 1 },
  { label: 'Last 3 days', days: 3 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 14 days', days: 14 },
]

const props = defineProps<{ column: Column<TData> | undefined }>()

function formatRange(from: Date, to: Date) {
  const start = formatDay(utcDayStart(from))
  const end = formatDay(utcDayStart(to))
  return start === end ? start : `${start} – ${end}`
}

const value = computed(
  () => props.column?.getFilterValue() as DateRangeValue | undefined,
)
const open = ref(false)
// The range being picked; it only becomes the filter once both ends are set
const draft = ref<DateRangeValue | undefined>(value.value)
const today = calendarDate(NOW)

function apply(range: DateRangeValue | undefined) {
  props.column?.setFilterValue(range)
  draft.value = range
  open.value = false
}

// The calendar emits a range as the user clicks: first the start, then the end
function onSelect(range: { start?: DateValue; end?: DateValue }) {
  const from = fromCalendarDate(range.start)
  const to = fromCalendarDate(range.end)
  if (from && to) apply({ from, to })
  else draft.value = from ? { from, to: undefined } : undefined
}

function onOpenChange(next: boolean) {
  open.value = next
  // Reopening shows the applied range, not a half-picked leftover
  if (next) draft.value = value.value
}
</script>

<template>
  <Popover :open="open" @update:open="onOpenChange">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        size="sm"
        :class="cn('h-8 font-normal', !value && 'border-dashed')"
      >
        <CalendarIcon class="size-3.5" />
        {{
          value?.from && value.to ? formatRange(value.from, value.to) : 'Date range'
        }}
      </Button>
    </PopoverTrigger>
    <PopoverContent class="flex w-auto flex-col p-0 sm:flex-row" align="end">
      <div
        class="flex flex-wrap gap-0.5 border-b p-2 sm:w-32 sm:flex-col sm:border-r sm:border-b-0"
      >
        <Button
          v-for="preset in presets"
          :key="preset.label"
          variant="ghost"
          size="sm"
          class="justify-start font-normal"
          @click="
            apply({ from: calendarDate(NOW - (preset.days - 1) * DAY), to: today })
          "
        >
          {{ preset.label }}
        </Button>
      </div>
      <div>
        <RangeCalendar
          :number-of-months="2"
          :default-placeholder="toCalendarDate(calendarDate(NOW - 30 * DAY))"
          :max-value="toCalendarDate(today)"
          :model-value="{
            start: toCalendarDate(draft?.from),
            end: toCalendarDate(draft?.to),
          }"
          @update:model-value="onSelect"
        />
        <div class="flex items-center gap-2 border-t px-3 py-2">
          <p class="text-sm text-muted-foreground tabular-nums">
            <template v-if="!draft?.from">Pick a start date</template>
            <template v-else-if="!draft.to">
              {{ formatDay(utcDayStart(draft.from)) }} – pick an end date
            </template>
            <template v-else>{{ formatRange(draft.from, draft.to) }}</template>
          </p>
          <Button
            v-if="value"
            variant="ghost"
            size="sm"
            class="ml-auto h-7 font-normal"
            @click="apply(undefined)"
          >
            Clear
          </Button>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
