<script lang="ts" generics="TData">
  import type { Column } from '@tanstack/table-core'
  import * as Select from '$lib/components/ui/select/index.js'

  type Props = {
    column?: Column<TData, unknown>
    label: string
    allLabel: string
    options: string[]
  }

  let { column, label, allLabel, options }: Props = $props()

  const value = $derived((column?.getFilterValue() as string | undefined) ?? 'all')
</script>

<Select.Root
  type="single"
  {value}
  onValueChange={(next) =>
    column?.setFilterValue(next === 'all' ? undefined : next)}
>
  <Select.Trigger class="w-40" aria-label="Filter by {label}">
    {value === 'all' ? allLabel : value}
  </Select.Trigger>
  <Select.Content>
    <Select.Group>
      <Select.Item value="all" label={allLabel}>{allLabel}</Select.Item>
      {#each options as option (option)}
        <Select.Item value={option} label={option}>{option}</Select.Item>
      {/each}
    </Select.Group>
  </Select.Content>
</Select.Root>
