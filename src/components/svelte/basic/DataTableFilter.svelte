<script lang="ts" generics="TData">
  import type { Column } from '@tanstack/table-core'
  import * as Select from '$lib/components/ui/select/index.js'

  type Props = {
    column?: Column<TData, unknown>
    title: string
    options: { value: string; label: string }[]
  }

  let { column, title, options }: Props = $props()

  const value = $derived((column?.getFilterValue() as string | undefined) ?? '')
  const selectedLabel = $derived(
    options.find((option) => option.value === value)?.label ?? title,
  )
</script>

<Select.Root
  type="single"
  {value}
  onValueChange={(next) => column?.setFilterValue(next)}
>
  <Select.Trigger class="w-45">
    {selectedLabel}
  </Select.Trigger>
  <Select.Content>
    <Select.Group>
      {#each options as option (option.value)}
        <Select.Item value={option.value} label={option.label}>
          {option.label}
        </Select.Item>
      {/each}
    </Select.Group>
  </Select.Content>
</Select.Root>
