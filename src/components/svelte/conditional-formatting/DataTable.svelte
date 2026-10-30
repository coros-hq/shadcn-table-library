<script lang="ts" generics="TData, TValue">
  import {
    getCoreRowModel,
    getSortedRowModel,
    type ColumnDef,
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

  type Props = {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
  }

  let { columns, data }: Props = $props()

  let sorting = $state<SortingState>([])

  const table = createSvelteTable({
    get data() {
      return data
    },
    get columns() {
      return columns
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: (updater) => {
      sorting = typeof updater === 'function' ? updater(sorting) : updater
    },
    state: {
      get sorting() {
        return sorting
      },
    },
  })
</script>

<div class="overflow-hidden rounded-md border">
  <Table.Root>
    <Table.Header>
      {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
        <Table.Row>
          {#each headerGroup.headers as header (header.id)}
            <Table.Head
              class={header.column.getCanSort()
                ? 'cursor-pointer select-none'
                : undefined}
              onclick={header.column.getToggleSortingHandler()}
            >
              <div class="flex items-center gap-2">
                {#if !header.isPlaceholder}
                  <FlexRender
                    content={header.column.columnDef.header}
                    context={header.getContext()}
                  />
                {/if}
                {#if header.column.getCanSort()}
                  {#if header.column.getIsSorted() === 'asc'}
                    <ArrowUp class="h-3 w-3" />
                  {:else if header.column.getIsSorted() === 'desc'}
                    <ArrowDown class="h-3 w-3" />
                  {:else}
                    <ArrowUpDown class="h-3 w-3 opacity-50" />
                  {/if}
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
