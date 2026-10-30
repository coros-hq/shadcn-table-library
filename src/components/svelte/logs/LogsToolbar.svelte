<script lang="ts">
  import type { Table } from '@tanstack/table-core'
  import Search from '@lucide/svelte/icons/search'
  import X from '@lucide/svelte/icons/x'

  import { Button } from '$lib/components/ui/button/index.js'
  import { Input } from '$lib/components/ui/input/index.js'
  import { levels, services, statusClasses } from './data'
  import type { LogEntry, LogLevel } from './data'
  import DateRangeFilter from './DateRangeFilter.svelte'
  import FacetedFilter from './FacetedFilter.svelte'
  import LevelDot from './LevelDot.svelte'
  import { clearFilters, isFiltered } from './toolbar'

  let { table }: { table: Table<LogEntry> } = $props()
</script>

<div class="flex flex-wrap items-center gap-2">
  <div class="relative w-full sm:w-auto sm:max-w-64 sm:min-w-40 sm:flex-1">
    <Search
      class="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
    />
    <Input
      value={table.getState().globalFilter as string}
      placeholder="Message, path, request id…"
      aria-label="Search logs"
      class="h-8 pl-8"
      oninput={(e) => table.setGlobalFilter(e.currentTarget.value)}
    />
  </div>
  <div class="flex flex-wrap items-center gap-2 sm:ml-auto sm:justify-end">
    {#if isFiltered(table)}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        class="h-8 px-2"
        onclick={() => clearFilters(table)}
      >
        Reset
        <X class="size-3.5" />
      </Button>
    {/if}
    <DateRangeFilter column={table.getColumn('timestamp')} />
    <FacetedFilter
      column={table.getColumn('level')}
      title="Level"
      options={levels}
      formatLabel={(level) => level[0].toUpperCase() + level.slice(1)}
    >
      {#snippet icon(value)}
        <LevelDot level={value as LogLevel} />
      {/snippet}
    </FacetedFilter>
    <FacetedFilter
      column={table.getColumn('service')}
      title="Service"
      options={services}
    />
    <FacetedFilter
      column={table.getColumn('statusClass')}
      title="Status"
      options={statusClasses}
    />
  </div>
</div>
