<script lang="ts" generics="TData">
  import type { Table } from '@tanstack/table-core'
  import AddFilterTrigger from './AddFilterTrigger.svelte'
  import FilterConditionPill from './FilterConditionPill.svelte'
  import { useFilterConditions } from './use-filter-conditions.svelte'
  import './types'

  let { table }: { table: Table<TData> } = $props()

  // svelte-ignore state_referenced_locally
  const conditions = useFilterConditions(table)

  const filterableColumns = $derived(
    table.getAllColumns().filter((column) => column.columnDef.meta?.filterVariant),
  )

  const availableColumnIds = $derived.by(() => {
    const activeColumnIds = new Set(conditions.current.map((c) => c.columnId))
    return filterableColumns
      .filter((column) => !activeColumnIds.has(column.id))
      .map((column) => column.id)
  })
</script>

{#if filterableColumns.length > 0}
  <div class="flex flex-wrap items-center gap-2">
    {#each conditions.current as condition (condition.columnId)}
      <FilterConditionPill {table} {condition} />
    {/each}

    {#if availableColumnIds.length > 0}
      <AddFilterTrigger {table} {availableColumnIds} />
    {/if}
  </div>
{/if}
