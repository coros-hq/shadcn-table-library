<script lang="ts" generics="TData extends RowData">
  import {
    FlexRender,
    createTable,
    type ColumnDef,
    type ColumnFiltersState,
    type RowData,
  } from '@tanstack/svelte-table'
  import { v9Features, type V9Features } from '$lib/table-v9-features'
  import * as Table from '$lib/components/ui/table/index.js'
  import { Input } from '$lib/components/ui/input/index.js'
  import ToolbarSelect from './ToolbarSelect.svelte'

  interface FilterOption {
    value: string
    label: string
  }

  type Props = {
    columns: ColumnDef<V9Features, TData, any>[]
    data: TData[]
    categoryOptions: FilterOption[]
    statusOptions: FilterOption[]
  }

  let { columns, data, categoryOptions, statusOptions }: Props = $props()

  let columnFilters = $state<ColumnFiltersState>([])
  let globalFilter = $state('')

  const table = createTable({
    features: v9Features,
    get data() {
      return data
    },
    get columns() {
      return columns
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
      placeholder="Search tasks…"
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
                  <FlexRender {header} />
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
                <FlexRender {cell} />
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
