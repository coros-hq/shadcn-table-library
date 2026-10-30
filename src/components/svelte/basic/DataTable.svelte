<script lang="ts" generics="TData, TValue">
  import type { Snippet } from 'svelte'
  import {
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type ColumnDef,
    type ColumnFiltersState,
    type PaginationState,
    type SortingState,
    type Table as TanstackTable,
  } from '@tanstack/table-core'
  import ArrowDown from '@lucide/svelte/icons/arrow-down'
  import ArrowUp from '@lucide/svelte/icons/arrow-up'
  import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down'
  import ChevronLeft from '@lucide/svelte/icons/chevron-left'
  import ChevronRight from '@lucide/svelte/icons/chevron-right'
  import ChevronsLeft from '@lucide/svelte/icons/chevrons-left'
  import ChevronsRight from '@lucide/svelte/icons/chevrons-right'
  import X from '@lucide/svelte/icons/x'
  import {
    FlexRender,
    createSvelteTable,
  } from '$lib/components/ui/data-table/index.js'
  import * as Table from '$lib/components/ui/table/index.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import { Input } from '$lib/components/ui/input/index.js'
  import * as Select from '$lib/components/ui/select/index.js'

  type Props = {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    // Rendered in the toolbar, next to the search input
    filters?: Snippet<[TanstackTable<TData>]>
  }

  let { columns, data, filters }: Props = $props()

  const PAGE_SIZES = ['10', '20', '30', '40', '50']

  let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 })
  let columnFilters = $state<ColumnFiltersState>([])
  let globalFilter = $state('')
  let sorting = $state<SortingState>([])

  const table = createSvelteTable({
    get data() {
      return data
    },
    get columns() {
      return columns
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: (updater) => {
      pagination = typeof updater === 'function' ? updater(pagination) : updater
    },
    onSortingChange: (updater) => {
      sorting = typeof updater === 'function' ? updater(sorting) : updater
    },
    onColumnFiltersChange: (updater) => {
      columnFilters =
        typeof updater === 'function' ? updater(columnFilters) : updater
    },
    onGlobalFilterChange: (updater) => {
      globalFilter =
        typeof updater === 'function' ? updater(globalFilter) : updater
    },
    state: {
      get pagination() {
        return pagination
      },
      get sorting() {
        return sorting
      },
      get columnFilters() {
        return columnFilters
      },
      get globalFilter() {
        return globalFilter
      },
    },
  })
</script>

<div>
  <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
    <Input
      type="text"
      placeholder="Search..."
      class="filter-input w-full sm:w-64"
      oninput={(e) => table.setGlobalFilter(e.currentTarget.value)}
    />
    <div class="flex flex-wrap items-center gap-2">
      {#if table.getState().columnFilters.length > 0}
        <Button
          variant="link"
          class="underline"
          onclick={() => table.resetColumnFilters()}
        >
          Clear Filters <X class="h-3 w-3" />
        </Button>
      {/if}
      {@render filters?.(table)}
    </div>
  </div>

  <div class="overflow-hidden rounded-md border">
    <Table.Root>
      <Table.Header>
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row>
            {#each headerGroup.headers as header (header.id)}
              {@const toggleSorting = header.column.getToggleSortingHandler()}
              <Table.Head
                tabindex={header.column.getCanSort() ? 0 : undefined}
                role={header.column.getCanSort() ? 'button' : undefined}
                class={header.column.getCanSort()
                  ? 'cursor-pointer select-none'
                  : undefined}
                onclick={toggleSorting}
                onkeydown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggleSorting?.(e)
                  }
                }}
              >
                <div class="flex flex-row items-center gap-2">
                  {#if !header.isPlaceholder}
                    <FlexRender
                      content={header.column.columnDef.header}
                      context={header.getContext()}
                    />
                  {/if}
                  {#if header.column.getCanSort()}
                    <span>
                      {#if header.column.getIsSorted() === 'asc'}
                        <ArrowUp class="h-3 w-3" />
                      {:else if header.column.getIsSorted() === 'desc'}
                        <ArrowDown class="h-3 w-3" />
                      {:else}
                        <ArrowUpDown class="h-3 w-3 opacity-50" />
                      {/if}
                    </span>
                  {/if}
                </div>
              </Table.Head>
            {/each}
          </Table.Row>
        {/each}
      </Table.Header>
      <Table.Body>
        {#each table.getRowModel().rows as row (row.id)}
          <Table.Row data-state={row.getIsSelected() ? 'selected' : undefined}>
            {#each row.getVisibleCells() as cell (cell.id)}
              <Table.Cell>
                <FlexRender
                  content={cell.column.columnDef.cell}
                  context={cell.getContext()}
                />
              </Table.Cell>
            {/each}
          </Table.Row>
        {:else}
          <Table.Row>
            <Table.Cell colspan={columns.length} class="h-24 text-center">
              No results.
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>

  <div class="mt-5 flex justify-end gap-1">
    <Button
      variant="outline"
      disabled={!table.getCanPreviousPage()}
      onclick={() => table.firstPage()}
    >
      <ChevronsLeft class="h-3 w-3" />
    </Button>
    <Button
      variant="outline"
      disabled={!table.getCanPreviousPage()}
      onclick={() => table.previousPage()}
    >
      <ChevronLeft class="h-3 w-3" />
    </Button>
    <Button
      variant="outline"
      disabled={!table.getCanNextPage()}
      onclick={() => table.nextPage()}
    >
      <ChevronRight class="h-3 w-3" />
    </Button>
    <Button
      variant="outline"
      disabled={!table.getCanNextPage()}
      onclick={() => table.lastPage()}
    >
      <ChevronsRight class="h-3 w-3" />
    </Button>
    <Select.Root
      type="single"
      value={pagination.pageSize.toString()}
      onValueChange={(val) => table.setPageSize(Number(val))}
    >
      <Select.Trigger class="h-1/3">
        {pagination.pageSize}
      </Select.Trigger>
      <Select.Content>
        <Select.Group>
          {#each PAGE_SIZES as size (size)}
            <Select.Item value={size} label={size}>{size}</Select.Item>
          {/each}
        </Select.Group>
      </Select.Content>
    </Select.Root>
  </div>
</div>
