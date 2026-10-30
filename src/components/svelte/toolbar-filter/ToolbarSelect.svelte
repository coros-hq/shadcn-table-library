<script lang="ts" generics="TData">
  import type { Column } from '@tanstack/table-core'
  import * as Select from '$lib/components/ui/select/index.js'

  type Props = {
    column?: Column<TData, unknown>
    placeholder: string
    options: { value: string; label: string }[]
  }

  let { column, placeholder, options }: Props = $props()

  const value = $derived((column?.getFilterValue() as string | undefined) ?? 'all')
  const selectedLabel = $derived(
    value === 'all'
      ? `All ${placeholder.toLowerCase()}`
      : (options.find((option) => option.value === value)?.label ?? placeholder),
  )
</script>

<Select.Root
  type="single"
  {value}
  onValueChange={(next) =>
    column?.setFilterValue(next === 'all' ? undefined : next)}
>
  <Select.Trigger class="w-40">
    {selectedLabel}
  </Select.Trigger>
  <Select.Content>
    <Select.Group>
      <Select.Item value="all" label="All {placeholder.toLowerCase()}">
        All {placeholder.toLowerCase()}
      </Select.Item>
      {#each options as option (option.value)}
        <Select.Item value={option.value} label={option.label}>
          {option.label}
        </Select.Item>
      {/each}
    </Select.Group>
  </Select.Content>
</Select.Root>
