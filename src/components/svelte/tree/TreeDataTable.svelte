<script lang="ts" generics="TData extends { children?: TData[] }">
  import {
    getCoreRowModel,
    getExpandedRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    type ColumnDef,
    type ExpandedState,
    type SortingState,
  } from '@tanstack/table-core'
  import ArrowDown from '@lucide/svelte/icons/arrow-down'
  import ArrowUp from '@lucide/svelte/icons/arrow-up'
  import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down'
  import {
    FlexRender,
    createSvelteTable,
  } from '$lib/components/ui/data-table/index.js'
  import * as Table from '$lib/components/ui/table/index.js'
  import { Input } from '$lib/components/ui/input/index.js'

  type Props = {
    columns: ColumnDef<TData, any>[]
    data: TData[]
  }

  let { columns, data }: Props = $props()

  let sorting = $state<SortingState>([])
  let globalFilter = $state('')
  let expanded = $state<ExpandedState>(true)

  const table = createSvelteTable({
    get data() {
      return data
    },
    get columns() {
      return columns
    },
    getCoreRowModel: getCoreRowModel(),
    getSubRows: (row) => row.children,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    filterFromLeafRows: true,
    onExpandedChange: (updater) => {
      expanded = typeof updater === 'function' ? updater(expanded) : updater
    },
    onSortingChange: (updater) => {
      sorting = typeof updater === 'function' ? updater(sorting) : updater
    },
    onGlobalFilterChange: (updater) => {
      globalFilter =
        typeof updater === 'function' ? updater(globalFilter) : updater
    },
    state: {
      get sorting() {
        return sorting
      },
      get globalFilter() {
        return globalFilter
      },
      get expanded() {
        return expanded
      },
    },
  })
</script>

<div>
  <Input
    type="text"
    placeholder="Search..."
    class="mb-3 w-64"
    oninput={(e) => table.setGlobalFilter(e.currentTarget.value)}
  />
  <div class="overflow-hidden rounded-md border">
    <Table.Root>
      <Table.Header>
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row>
            {#each headerGroup.headers as header (header.id)}
              {@const canSort = header.column.getCanSort()}
              {@const toggleSorting = header.column.getToggleSortingHandler()}
              <Table.Head
                tabindex={canSort ? 0 : undefined}
                role={canSort ? 'button' : undefined}
                class={canSort ? 'cursor-pointer select-none' : undefined}
                onclick={toggleSorting}
                onkeydown={(e) => {
                  if (canSort && (e.key === 'Enter' || e.key === ' ')) {
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
                  {#if canSort}
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
