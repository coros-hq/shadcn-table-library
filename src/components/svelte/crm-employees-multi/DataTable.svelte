<script lang="ts" generics="TValue">
  import {
    getCoreRowModel,
    getFilteredRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getPaginationRowModel,
    getSortedRowModel,
    type ColumnDef,
    type FilterFn,
    type SortingState,
  } from '@tanstack/table-core'
  import ArrowDown from '@lucide/svelte/icons/arrow-down'
  import ArrowUp from '@lucide/svelte/icons/arrow-up'
  import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down'
  import X from '@lucide/svelte/icons/x'
  import {
    FlexRender,
    createSvelteTable,
  } from '$lib/components/ui/data-table/index.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import { Input } from '$lib/components/ui/input/index.js'
  import * as Table from '$lib/components/ui/table/index.js'
  import ColumnMultiSelect from './ColumnMultiSelect.svelte'
  import * as Select from '$lib/components/ui/select/index.js'
  import type { Employee } from './data'

  type Props = {
    columns: ColumnDef<Employee, TValue>[]
    data: Employee[]
    departments: string[]
    statuses: string[]
  }

  let { columns, data, departments, statuses }: Props = $props()

  // Searches the fields a person would actually type: name, email, role,
  // department and location — not just the columns that happen to be strings.
  const employeeSearch: FilterFn<Employee> = (row, _columnId, value) => {
    const query = String(value).trim().toLowerCase()
    if (!query) return true
    const { name, email, role, department, location } = row.original
    return [name, email, role, department, location].some((field) =>
      field.toLowerCase().includes(query),
    )
  }

  type Density = 'compact' | 'comfortable' | 'spacious'

  // Padding and type size live on the cells, so every column follows the toggle
  // without its own cell renderer knowing about density.
  const densityCell: Record<Density, string> = {
    compact: 'py-1 text-xs',
    comfortable: 'py-2 text-sm',
    spacious: 'py-4 text-base',
  }

  const densityHead: Record<Density, string> = {
    compact: 'h-8 text-xs',
    comfortable: 'h-10 text-sm',
    spacious: 'h-14 text-base',
  }

  const densityLabel: Record<Density, string> = {
    compact: 'Compact',
    comfortable: 'Comfortable',
    spacious: 'Spacious',
  }

  let density = $state<Density>('comfortable')
  let sorting = $state<SortingState>([])
  let globalFilter = $state('')

  const table = createSvelteTable({
    get data() {
      return data
    },
    get columns() {
      return columns
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: employeeSearch,
    onSortingChange: (updater) => {
      sorting = typeof updater === 'function' ? updater(sorting) : updater
    },
    onGlobalFilterChange: (updater) => {
      globalFilter =
        typeof updater === 'function' ? updater(globalFilter) : updater
    },
    getRowId: (row) => row.id,
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
      // Department is rendered under Role, so its own column stays hidden
      // while still being filterable from the toolbar.
      columnVisibility: { department: false },
    },
    state: {
      get sorting() {
        return sorting
      },
      get globalFilter() {
        return globalFilter
      },
    },
  })

  const summary = $derived.by(() => {
    const { pageIndex, pageSize } = table.getState().pagination
    const filteredCount = table.getFilteredRowModel().rows.length
    const selectedCount = table.getFilteredSelectedRowModel().rows.length
    const from = filteredCount === 0 ? 0 : pageIndex * pageSize + 1
    const to = Math.min((pageIndex + 1) * pageSize, filteredCount)
    return `${selectedCount > 0 ? `${selectedCount} selected · ` : ''}Showing ${from}–${to} of ${filteredCount} employees`
  })

  function ariaSort(sorted: false | 'asc' | 'desc') {
    return sorted === 'asc'
      ? 'ascending'
      : sorted === 'desc'
        ? 'descending'
        : undefined
  }
</script>

<div>
  <div class="mb-3 flex flex-wrap items-center gap-2">
    <Input
      bind:value={globalFilter}
      type="search"
      placeholder="Search name, email, role, location..."
      aria-label="Search employees"
      class="w-full sm:w-72"
    />
    <ColumnMultiSelect
      column={table.getColumn('department')}
      title="Department"
      options={departments}
    />
    <ColumnMultiSelect
      column={table.getColumn('status')}
      title="Status"
      options={statuses}
    />
    {#if table.getState().columnFilters.length > 0}
      <Button variant="ghost" size="sm" onclick={() => table.resetColumnFilters()}>
        Reset
        <X class="h-4 w-4" />
      </Button>
    {/if}
    <Select.Root
      type="single"
      value={density}
      onValueChange={(next) => (density = next as Density)}
    >
      <Select.Trigger class="w-40 sm:ml-auto" aria-label="Row density">
        {densityLabel[density]}
      </Select.Trigger>
      <Select.Content>
        <Select.Group>
          <Select.Item value="compact" label="Compact">Compact</Select.Item>
          <Select.Item value="comfortable" label="Comfortable">Comfortable</Select.Item>
          <Select.Item value="spacious" label="Spacious">Spacious</Select.Item>
        </Select.Group>
      </Select.Content>
    </Select.Root>
  </div>

  <div class="overflow-x-auto rounded-md border">
    <Table.Root>
      <Table.Header>
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row>
            {#each headerGroup.headers as header (header.id)}
              <Table.Head
                class={densityHead[density]}
                aria-sort={ariaSort(header.column.getIsSorted())}
              >
                {#if !header.isPlaceholder}
                  {#if header.column.getCanSort()}
                    <button
                      type="button"
                      class="flex w-full cursor-pointer items-center gap-2 whitespace-nowrap select-none"
                      onclick={header.column.getToggleSortingHandler()}
                    >
                      <FlexRender
                        content={header.column.columnDef.header}
                        context={header.getContext()}
                      />
                      {#if header.column.getIsSorted() === 'asc'}
                        <ArrowUp class="h-3 w-3 shrink-0" />
                      {:else if header.column.getIsSorted() === 'desc'}
                        <ArrowDown class="h-3 w-3 shrink-0" />
                      {:else}
                        <ArrowUpDown class="h-3 w-3 shrink-0 opacity-50" />
                      {/if}
                    </button>
                  {:else}
                    <FlexRender
                      content={header.column.columnDef.header}
                      context={header.getContext()}
                    />
                  {/if}
                {/if}
              </Table.Head>
            {/each}
          </Table.Row>
        {/each}
      </Table.Header>
      <Table.Body>
        {#each table.getRowModel().rows as row (row.id)}
          <Table.Row data-state={row.getIsSelected() ? 'selected' : undefined}>
            {#each row.getVisibleCells() as cell (cell.id)}
              <Table.Cell class={densityCell[density]}>
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
              class="h-24 text-center"
            >
              No employees match your filters.
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>

  <div class="flex flex-wrap items-center justify-between gap-2 py-3">
    <p class="text-sm text-muted-foreground" aria-live="polite">
      {summary}
    </p>
    <div class="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={!table.getCanPreviousPage()}
        onclick={() => table.previousPage()}
      >
        Previous
      </Button>
      <span class="text-sm tabular-nums text-muted-foreground">
        Page {table.getState().pagination.pageIndex + 1} of
        {Math.max(table.getPageCount(), 1)}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={!table.getCanNextPage()}
        onclick={() => table.nextPage()}
      >
        Next
      </Button>
    </div>
  </div>
</div>
