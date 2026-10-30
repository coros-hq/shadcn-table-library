<script lang="ts" generics="TData, TValue">
  import {
    getCoreRowModel,
    getFilteredRowModel,
    type ColumnDef,
    type ColumnFiltersState,
  } from '@tanstack/table-core'
  import {
    FlexRender,
    createSvelteTable,
  } from '$lib/components/ui/data-table/index.js'
  import * as Table from '$lib/components/ui/table/index.js'
  import { Input } from '$lib/components/ui/input/index.js'
  import ToolbarSelect from './ToolbarSelect.svelte'

  interface FilterOption {
    value: string
    label: string
  }

  type Props = {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    categoryOptions: FilterOption[]
    statusOptions: FilterOption[]
  }

  let { columns, data, categoryOptions, statusOptions }: Props = $props()

  let columnFilters = $state<ColumnFiltersState>([])
  let globalFilter = $state('')

  const table = createSvelteTable({
    get data() {
      return data
    },
    get columns() {
      return columns
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: (updater) => {
      columnFilters =
        typeof updater === 'function' ? updater(columnFilters) : updater
    },
    onGlobalFilterChange: (updater) => {
      globalFilter =
        typeof updater === 'function' ? updater(globalFilter) : updater
    },
    state: {
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
  <div class="mb-3 flex flex-wrap items-center gap-2">
    <Input
      bind:value={globalFilter}
      placeholder="Search tasks..."
      class="w-full sm:w-64"
    />
    <ToolbarSelect
      column={table.getColumn('category')}
      placeholder="Category"
      options={categoryOptions}
    />
    <ToolbarSelect
      column={table.getColumn('status')}
      placeholder="Status"
      options={statusOptions}
    />
  </div>

  <div class="overflow-hidden rounded-md border">
    <Table.Root>
      <Table.Header>
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row>
            {#each headerGroup.headers as header (header.id)}
              <Table.Head>
                {#if !header.isPlaceholder}
                  <FlexRender
                    content={header.column.columnDef.header}
                    context={header.getContext()}
                  />
                {/if}
              </Table.Head>
            {/each}
          </Table.Row>
        {/each}
      </Table.Header>
      <Table.Body>
        {#each table.getRowModel().rows as row (row.id)}
          <Table.Row>
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
</div>
