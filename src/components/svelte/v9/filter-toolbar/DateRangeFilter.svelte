<script lang="ts">
  import { format } from 'date-fns'
  import { CalendarDate, getLocalTimeZone } from '@internationalized/date'
  import type { DateValue } from '@internationalized/date'
  import CalendarIcon from '@lucide/svelte/icons/calendar'
  import { Button } from '$lib/components/ui/button/index.js'
  import { RangeCalendar } from '$lib/components/ui/range-calendar/index.js'
  import * as Popover from '$lib/components/ui/popover/index.js'
  import type { DateRangeValue } from './types'

  type Props = {
    label: string
    value?: DateRangeValue
  }

  let { label, value = $bindable() }: Props = $props()

  // The calendar speaks @internationalized/date; the filter value stores plain Dates
  const toCalendarDate = (date?: Date) =>
    date
      ? new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
      : undefined
  const toDate = (date?: DateValue) => date?.toDate(getLocalTimeZone())

  function onSelect(range: { start?: DateValue; end?: DateValue }) {
    const from = toDate(range.start)
    const to = toDate(range.end)
    value = from || to ? { from, to } : undefined
  }
</script>

<Popover.Root>
  <Popover.Trigger>
    {#snippet child({ props })}
      <Button {...props} variant="outline" size="sm">
        <CalendarIcon class="mr-2 h-4 w-4" />
        {#if value?.from}
          {format(value.from, 'MMM d')}
          {#if value.to} – {format(value.to, 'MMM d')}{/if}
        {:else}
          {label}
        {/if}
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class="w-auto p-0" align="start">
    <RangeCalendar
      numberOfMonths={2}
      placeholder={toCalendarDate(value?.from)}
      bind:value={
        () => ({ start: toCalendarDate(value?.from), end: toCalendarDate(value?.to) }),
        onSelect
      }
    />
  </Popover.Content>
</Popover.Root>
