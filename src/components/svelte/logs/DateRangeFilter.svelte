<script lang="ts" generics="TData">
  import CalendarIcon from '@lucide/svelte/icons/calendar'
  import type { Column } from '@tanstack/table-core'
  import type { DateValue } from '@internationalized/date'
  import { Button } from '$lib/components/ui/button/index.js'
  import { RangeCalendar } from '$lib/components/ui/range-calendar/index.js'
  import * as Popover from '$lib/components/ui/popover/index.js'
  import { cn } from '$lib/utils.js'
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

  let { column }: { column: Column<TData> | undefined } = $props()

  function formatRange(from: Date, to: Date) {
    const start = formatDay(utcDayStart(from))
    const end = formatDay(utcDayStart(to))
    return start === end ? start : `${start} – ${end}`
  }

  const value = $derived(column?.getFilterValue() as DateRangeValue | undefined)
  let open = $state(false)
  // The range being picked; it only becomes the filter once both ends are set
  // svelte-ignore state_referenced_locally
  let draft = $state<DateRangeValue | undefined>(value)
  const today = calendarDate(NOW)

  function apply(range: DateRangeValue | undefined) {
    column?.setFilterValue(range)
    draft = range
    open = false
  }

  // The calendar emits a range as the user clicks: first the start, then the end
  function onSelect(range: { start?: DateValue; end?: DateValue }) {
    const from = fromCalendarDate(range.start)
    const to = fromCalendarDate(range.end)
    if (from && to) apply({ from, to })
    else draft = from ? { from, to: undefined } : undefined
  }

  function onOpenChange(next: boolean) {
    open = next
    // Reopening shows the applied range, not a half-picked leftover
    if (next) draft = value
  }
</script>

<Popover.Root {open} {onOpenChange}>
  <Popover.Trigger>
    {#snippet child({ props })}
      <Button
        {...props}
        variant="outline"
        size="sm"
        class={cn('h-8 font-normal', !value && 'border-dashed')}
      >
        <CalendarIcon class="size-3.5" />
        {value?.from && value.to ? formatRange(value.from, value.to) : 'Date range'}
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class="flex w-auto flex-col p-0 sm:flex-row" align="end">
    <div
      class="flex flex-wrap gap-0.5 border-b p-2 sm:w-32 sm:flex-col sm:border-r sm:border-b-0"
    >
      {#each presets as preset (preset.label)}
        <Button
          variant="ghost"
          size="sm"
          class="justify-start font-normal"
          onclick={() =>
            apply({ from: calendarDate(NOW - (preset.days - 1) * DAY), to: today })}
        >
          {preset.label}
        </Button>
      {/each}
    </div>
    <div>
      <RangeCalendar
        numberOfMonths={2}
        placeholder={toCalendarDate(calendarDate(NOW - 30 * DAY))}
        maxValue={toCalendarDate(today)}
        bind:value={
          () => ({ start: toCalendarDate(draft?.from), end: toCalendarDate(draft?.to) }),
          onSelect
        }
      />
      <div class="flex items-center gap-2 border-t px-3 py-2">
        <p class="text-sm text-muted-foreground tabular-nums">
          {#if !draft?.from}
            Pick a start date
          {:else if !draft.to}
            {formatDay(utcDayStart(draft.from))} – pick an end date
          {:else}
            {formatRange(draft.from, draft.to)}
          {/if}
        </p>
        {#if value}
          <Button
            variant="ghost"
            size="sm"
            class="ml-auto h-7 font-normal"
            onclick={() => apply(undefined)}
          >
            Clear
          </Button>
        {/if}
      </div>
    </div>
  </Popover.Content>
</Popover.Root>
