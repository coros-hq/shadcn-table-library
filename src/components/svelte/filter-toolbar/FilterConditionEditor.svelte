<script lang="ts" generics="TData">
  import type { Table } from '@tanstack/table-core'
  import { Button } from '$lib/components/ui/button/index.js'
  import * as Command from '$lib/components/ui/command/index.js'
  import * as Select from '$lib/components/ui/select/index.js'
  import FilterValueInput from './FilterValueInput.svelte'
  import { isValueValid, operatorRegistry } from './operators'
  import './types'

  type Props = {
    table: Table<TData>
    /** Locked column — present when editing an existing condition. */
    columnId?: string
    /** Columns selectable in the "pick a column" step (add mode only). */
    availableColumnIds?: string[]
    initialOperator?: string
    initialValue?: unknown
    /** Show the Remove button (edit mode only). */
    removable?: boolean
    onapply?: (columnId: string, operator: string, value: unknown) => void
    onremove?: () => void
  }

  let {
    table,
    columnId: lockedColumnId,
    availableColumnIds = [],
    initialOperator,
    initialValue,
    removable = false,
    onapply,
    onremove,
  }: Props = $props()

  // svelte-ignore state_referenced_locally
  let columnId = $state<string | undefined>(lockedColumnId)
  // svelte-ignore state_referenced_locally
  let operator = $state<string | undefined>(initialOperator)
  // svelte-ignore state_referenced_locally
  let value = $state<unknown>(initialValue)

  const meta = $derived(columnId ? table.getColumn(columnId)?.columnDef.meta : undefined)
  const operators = $derived(
    meta?.filterVariant ? operatorRegistry[meta.filterVariant] : [],
  )
  const activeOperator = $derived(operators.find((o) => o.value === operator))

  function selectColumn(id: string) {
    const nextMeta = table.getColumn(id)?.columnDef.meta
    const nextOperators = nextMeta?.filterVariant
      ? operatorRegistry[nextMeta.filterVariant]
      : []
    columnId = id
    operator = nextOperators[0]?.value
    value = undefined
  }

  function apply() {
    if (columnId && activeOperator) {
      onapply?.(columnId, activeOperator.value, value)
    }
  }
</script>

{#if !lockedColumnId && !columnId}
  <!-- Step 1: no column locked and none picked yet — choose which column to filter. -->
  <Command.Root>
    <Command.Input placeholder="Filter by..." />
    <Command.List>
      <Command.Empty>No more columns to filter.</Command.Empty>
      <Command.Group>
        {#each availableColumnIds as id (id)}
          <Command.Item
            value={table.getColumn(id)?.columnDef.meta?.label ?? id}
            onSelect={() => selectColumn(id)}
          >
            {table.getColumn(id)?.columnDef.meta?.label}
          </Command.Item>
        {/each}
      </Command.Group>
    </Command.List>
  </Command.Root>
{:else if columnId && meta?.filterVariant}
  <!-- Step 2: column is set — choose operator, then the matching value input. -->
  <div class="space-y-3 p-3">
    <p class="text-sm font-medium text-foreground">{meta.label}</p>

    <Select.Root
      type="single"
      value={operator ?? ''}
      onValueChange={(next) => (operator = next)}
    >
      <Select.Trigger class="w-full">
        {activeOperator?.label ?? 'Operator'}
      </Select.Trigger>
      <Select.Content>
        <Select.Group>
          {#each operators as op (op.value)}
            <Select.Item value={op.value} label={op.label}>{op.label}</Select.Item>
          {/each}
        </Select.Group>
      </Select.Content>
    </Select.Root>

    {#if activeOperator}
      <FilterValueInput
        bind:value
        label={meta.label}
        variant={meta.filterVariant}
        operator={activeOperator}
        options={meta.filterOptions}
      />
    {/if}

    <div class="flex items-center justify-between pt-1">
      {#if removable}
        <Button type="button" variant="ghost" size="sm" onclick={() => onremove?.()}>
          Remove
        </Button>
      {:else}
        <span></span>
      {/if}
      <Button
        type="button"
        size="sm"
        disabled={!activeOperator || !isValueValid(activeOperator, value)}
        onclick={apply}
      >
        Apply
      </Button>
    </div>
  </div>
{/if}
