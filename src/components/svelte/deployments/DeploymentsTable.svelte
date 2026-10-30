<script lang="ts">
  import {
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    type ColumnDef,
    type ColumnFiltersState,
    type FilterFn,
  } from '@tanstack/table-core'
  import ChevronLeft from '@lucide/svelte/icons/chevron-left'
  import ChevronRight from '@lucide/svelte/icons/chevron-right'
  import Search from '@lucide/svelte/icons/search'
  import X from '@lucide/svelte/icons/x'
  import {
    FlexRender,
    createSvelteTable,
  } from '$lib/components/ui/data-table/index.js'
  import * as Table from '$lib/components/ui/table/index.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import { Input } from '$lib/components/ui/input/index.js'
  import * as Select from '$lib/components/ui/select/index.js'
  import { cn } from '$lib/utils.js'
  import { hiddenColumns } from './columns'
  import { environments, statuses } from './data'
  import type { Deployment, DeploymentStatus } from './data'
  import FacetedFilter from './FacetedFilter.svelte'
  import StatusIcon from './StatusIcon.svelte'

  const datePresets = [
    { value: 'all', label: 'All time', days: undefined },
    { value: '1', label: 'Last 24 hours', days: 1 },
    { value: '7', label: 'Last 7 days', days: 7 },
    { value: '30', label: 'Last 30 days', days: 30 },
  ] as const

  // Search matches the fields people actually paste: id, branch, sha, message, author
  const searchDeployments: FilterFn<Deployment> = (row, _id, query: string) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    const d = row.original
    return [d.id, d.branch, d.sha, d.message, d.author].some((field) =>
      field.toLowerCase().includes(q),
    )
  }

  type Props = {
    columns: ColumnDef<Deployment, any>[]
    data: Deployment[]
  }

  let { columns, data }: Props = $props()

  let columnFilters = $state<ColumnFiltersState>([])
  let globalFilter = $state('')

  const table = createSvelteTable({
    get data() {
      return data
    },
    get columns() {
      return columns
    },
    getRowId: (row) => row.id,
    state: {
      get columnFilters() {
        return columnFilters
      },
      get globalFilter() {
        return globalFilter
      },
    },
    onColumnFiltersChange: (updater) => {
      columnFilters =
        typeof updater === 'function' ? updater(columnFilters) : updater
    },
    onGlobalFilterChange: (updater) => {
      globalFilter =
        typeof updater === 'function' ? updater(globalFilter) : updater
    },
    globalFilterFn: searchDeployments,
    // Filters should send the user back to page 1, not leave them on an empty page 4
    autoResetPageIndex: true,
    initialState: {
      columnVisibility: hiddenColumns,
      pagination: { pageSize: 10 },
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const envColumn = $derived(table.getColumn('environment'))
  const dateColumn = $derived(table.getColumn('createdAt'))
  const environment = $derived(
    (envColumn?.getFilterValue() as string[] | undefined)?.[0] ?? 'all',
  )
  const days = $derived(dateColumn?.getFilterValue() as number | undefined)
  const isFiltered = $derived(columnFilters.length > 0 || globalFilter !== '')
  const branches = $derived([...new Set(data.map((d) => d.branch))].sort())

  function clearAll() {
    columnFilters = []
    globalFilter = ''
  }

  const filteredCount = $derived(table.getFilteredRowModel().rows.length)
  const pagination = $derived(table.getState().pagination)
  const dateValue = $derived(days === undefined ? 'all' : String(days))
</script>

<div class="space-y-3">
  <!-- Row 1: search + result count. Row 2: filters. -->
  <div class="flex items-center gap-3">
    <div class="relative w-full sm:w-72">
      <Search
        class="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        bind:value={globalFilter}
        placeholder="Branch, commit, author…"
        aria-label="Search deployments"
        class="h-8 pl-8"
      />
    </div>
    <p
      class="ml-auto shrink-0 text-sm text-muted-foreground tabular-nums"
      aria-live="polite"
    >
      {filteredCount === data.length
        ? `${data.length} deployments`
        : `${filteredCount} of ${data.length}`}
    </p>
  </div>

  <div class="flex flex-wrap items-center gap-2">
    <Select.Root
      type="single"
      value={environment}
      onValueChange={(value) =>
        envColumn?.setFilterValue(value === 'all' ? undefined : [value])}
    >
      <Select.Trigger size="sm" class="h-8 w-40" aria-label="Environment">
        {environment === 'all' ? 'All environments' : environment}
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="all" label="All environments">
          All environments
        </Select.Item>
        {#each environments as env (env)}
          <Select.Item value={env} label={env}>{env}</Select.Item>
        {/each}
      </Select.Content>
    </Select.Root>

    <FacetedFilter column={table.getColumn('status')} title="Status" options={statuses}>
      {#snippet icon(value)}
        <StatusIcon status={value as DeploymentStatus} />
      {/snippet}
    </FacetedFilter>
    <FacetedFilter column={table.getColumn('branch')} title="Branch" options={branches} />

    <Select.Root
      type="single"
      value={dateValue}
      onValueChange={(value) =>
        dateColumn?.setFilterValue(value === 'all' ? undefined : Number(value))}
    >
      <Select.Trigger size="sm" class="h-8 w-36" aria-label="Date range">
        {datePresets.find((preset) => preset.value === dateValue)?.label}
      </Select.Trigger>
      <Select.Content>
        {#each datePresets as preset (preset.value)}
          <Select.Item value={preset.value} label={preset.label}>
            {preset.label}
          </Select.Item>
        {/each}
      </Select.Content>
    </Select.Root>

    {#if isFiltered}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        class="h-8 px-2"
        onclick={clearAll}
      >
        Reset
        <X class="size-3.5" />
      </Button>
    {/if}
  </div>

  <div class="overflow-hidden rounded-md border">
    <Table.Root>
      <Table.Header>
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row>
            {#each headerGroup.headers as header (header.id)}
              <Table.Head class={cn(header.column.id === 'createdAt' && 'text-right')}>
                <FlexRender
                  content={header.column.columnDef.header}
                  context={header.getContext()}
                />
              </Table.Head>
            {/each}
          </Table.Row>
        {/each}
      </Table.Header>
      <Table.Body>
        {#each table.getRowModel().rows as row (row.id)}
          <Table.Row>
            {#each row.getVisibleCells() as cell (cell.id)}
              <Table.Cell class="py-3">
                <FlexRender
                  content={cell.column.columnDef.cell}
                  context={cell.getContext()}
                />
              </Table.Cell>
            {/each}
          </Table.Row>
        {:else}
          <Table.Row>
            <Table.Cell
              colspan={table.getVisibleLeafColumns().length}
              class="h-32 text-center"
            >
              <p class="text-muted-foreground">No deployments match these filters.</p>
              <Button type="button" variant="link" size="sm" onclick={clearAll}>
                Reset filters
              </Button>
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>

  {#if filteredCount > pagination.pageSize}
    <div class="flex items-center justify-end gap-2">
      <p class="mr-auto text-sm text-muted-foreground tabular-nums">
        {pagination.pageIndex * pagination.pageSize + 1}–{Math.min(
          (pagination.pageIndex + 1) * pagination.pageSize,
          filteredCount,
        )}
        of {filteredCount}
      </p>
      <Button
        type="button"
        variant="outline"
        size="icon"
        class="size-8"
        aria-label="Previous page"
        disabled={!table.getCanPreviousPage()}
        onclick={() => table.previousPage()}
      >
        <ChevronLeft class="size-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        class="size-8"
        aria-label="Next page"
        disabled={!table.getCanNextPage()}
        onclick={() => table.nextPage()}
      >
        <ChevronRight class="size-4" />
      </Button>
    </div>
  {/if}
</div>
