<script lang="ts" generics="TData extends RowData">
  import X from '@lucide/svelte/icons/x'
  import type { Table, RowData } from '@tanstack/svelte-table'
  import type { FilterToolbarFeatures } from './types'
  import { Badge } from '$lib/components/ui/badge/index.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import { useActiveFilters } from './use-active-filters.svelte'

  let { table }: { table: Table<FilterToolbarFeatures, TData> } = $props()

  // svelte-ignore state_referenced_locally
  const activeFilters = useActiveFilters(table)
</script>

{#if activeFilters.current.length > 0}
  <div class="flex flex-wrap items-center gap-2">
    {#each activeFilters.current as filter (filter.columnId)}
      <Badge variant="secondary" class="gap-1 pr-1">
        {filter.label}
        {filter.display}
        <button
          type="button"
          aria-label="Remove {filter.label} filter"
          onclick={() => table.getColumn(filter.columnId)?.setFilterValue(undefined)}
        >
          <X class="h-3 w-3" />
        </button>
      </Badge>
    {/each}
    <Button variant="ghost" size="sm" onclick={() => table.resetColumnFilters()}>
      Clear all
    </Button>
  </div>
{/if}
