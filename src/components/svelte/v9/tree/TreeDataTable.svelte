<script lang="ts" generics="TData extends RowData & { children?: TData[] }">
  import {
    createTable,
    FlexRender,
    type ColumnDef,
    type ExpandedState,
    type RowData,
    type SortingState,
  } from '@tanstack/svelte-table'
  import ArrowDown from '@lucide/svelte/icons/arrow-down'
  import ArrowUp from '@lucide/svelte/icons/arrow-up'
  import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down'
  import * as Table from '$lib/components/ui/table/index.js'
  import { Input } from '$lib/components/ui/input/index.js'
  import { v9Features, type V9Features } from '$lib/table-v9-features'

  type Props = {
    columns: ColumnDef<V9Features, TData, any>[]
    data: TData[]
  }

  let { columns, data }: Props = $props()

  let sorting = $state<SortingState>([])
  let globalFilter = $state('')
  let expanded = $state<ExpandedState>(true)

  const table = createTable({
    features: v9Features,
    // v9Features registers pagination, which would cut open groups off at 10 rows
    manualPagination: true,
    get data() {
      return data
    },
    get columns() {
      return columns
    },
    getSubRows: (row) => row.children,
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
                    <FlexRender {header} />
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
