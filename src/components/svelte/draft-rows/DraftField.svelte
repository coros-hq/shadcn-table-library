<script lang="ts">
  import { parseDate } from '@internationalized/date'
  import type { DateValue } from '@internationalized/date'
  import CalendarIcon from '@lucide/svelte/icons/calendar'
  import { Button } from '$lib/components/ui/button/index.js'
  import { Calendar } from '$lib/components/ui/calendar/index.js'
  import { Input } from '$lib/components/ui/input/index.js'
  import * as Popover from '$lib/components/ui/popover/index.js'
  import * as Select from '$lib/components/ui/select/index.js'
  import { cn } from '$lib/utils.js'
  import { categories, period, today } from './data'
  import { formatDate, parseAmount } from './drafts'
  import type { Field } from './drafts'
  import type { DraftMeta, DraftRow } from './types'

  // One control of a draft row, with its error message under it
  let { row, field, meta }: { row: DraftRow; field: Field; meta: DraftMeta } =
    $props()

  const labels: Record<Field, string> = {
    date: 'Date',
    description: 'Description',
    category: 'Category',
    amount: 'Amount in dollars',
  }

  const error = $derived(meta.shownErrors(row.id)[field])
  const errorId = $derived(`${row.id}-${field}-error`)
  const value = $derived(row.draft[field])
  const label = $derived(`${labels[field]}, new row ${row.number}`)

  const common = $derived({
    'data-draft': row.id,
    'data-field': field,
    'aria-invalid': !!error,
    'aria-describedby': error ? errorId : undefined,
    disabled: meta.saving,
  })

  const set = (next: string) => meta.update(row.id, field, next)
  const touch = () => meta.touch(row.id, field)

  function onblur() {
    if (field === 'amount') {
      // Tidy "12.5" into "12.50" once the user moves on
      const n = parseAmount(value)
      if (Number.isFinite(n) && !/\.\d{3,}$/.test(value)) set(n.toFixed(2))
    }
    touch()
  }

  // Enter in a text field goes to the same field one row down
  function onkeydown(event: KeyboardEvent) {
    if (event.key !== 'Enter' || event.isComposing) return
    event.preventDefault()
    meta.next(row.id, field)
  }

  // Closing a picker counts as leaving the field
  let dateOpen = $state(false)
  function onDateOpen(open: boolean) {
    dateOpen = open
    if (!open) touch()
  }
  function pickDate(date: DateValue | undefined) {
    if (!date) return
    set(date.toString())
    onDateOpen(false)
  }
</script>

<div class="space-y-1">
  {#if field === 'date'}
    <Popover.Root bind:open={() => dateOpen, onDateOpen}>
      <Popover.Trigger>
        {#snippet child({ props })}
          <Button
            {...props}
            {...common}
            variant="outline"
            size="sm"
            aria-label="{label}: {value ? formatDate(value) : 'not set'}"
            class={cn(
              'h-8 w-28 justify-start px-2 font-normal tabular-nums',
              'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
              !value && 'text-muted-foreground',
            )}
          >
            <CalendarIcon class="text-muted-foreground" />
            {value ? formatDate(value) : 'Pick a date'}
          </Button>
        {/snippet}
      </Popover.Trigger>
      <Popover.Content class="w-auto p-0" align="start">
        <!-- The report covers November up to today, nothing else -->
        <Calendar
          type="single"
          initialFocus
          value={value ? parseDate(value) : undefined}
          placeholder={parseDate(value || period.from)}
          minValue={parseDate(period.from)}
          maxValue={parseDate(today)}
          onValueChange={pickDate}
        />
      </Popover.Content>
    </Popover.Root>
  {:else if field === 'category'}
    <Select.Root
      type="single"
      {value}
      disabled={meta.saving}
      onValueChange={set}
      onOpenChange={(open) => !open && touch()}
    >
      <Select.Trigger {...common} aria-label={label} class="h-8 w-32">
        {#if value}{value}{:else}<span class="text-muted-foreground"
            >Choose…</span
          >{/if}
      </Select.Trigger>
      <Select.Content>
        {#each categories as c (c)}
          <Select.Item value={c} label={c}>{c}</Select.Item>
        {/each}
      </Select.Content>
    </Select.Root>
  {:else}
    <Input
      {...common}
      aria-label={label}
      inputmode={field === 'amount' ? 'decimal' : undefined}
      placeholder={field === 'amount' ? '0.00' : 'What was it for?'}
      {value}
      oninput={(e) => set(e.currentTarget.value)}
      {onblur}
      {onkeydown}
      class={cn(
        'h-8 px-2',
        field === 'description' && 'min-w-44',
        field === 'amount' && 'ml-auto w-28 text-right tabular-nums',
      )}
    />
  {/if}
  {#if error}
    <p id={errorId} class="text-xs text-destructive">{error}</p>
  {/if}
</div>
