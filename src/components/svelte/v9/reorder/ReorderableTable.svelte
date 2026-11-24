<script lang="ts" generics="TData extends RowData & { id: string }">
  import {
    FlexRender,
    createTable,
    type ColumnDef,
    type SortingState,
    type RowData,
  } from '@tanstack/svelte-table'
  import { v9Features, type V9Features } from '$lib/table-v9-features'
  import ArrowDown from '@lucide/svelte/icons/arrow-down'
  import ArrowUp from '@lucide/svelte/icons/arrow-up'
  import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down'
  import GripVertical from '@lucide/svelte/icons/grip-vertical'
  import * as Table from '$lib/components/ui/table/index.js'
  import { sortable } from './sortable'

  type Props = {
    columns: ColumnDef<V9Features, TData, any>[]
    // The parent owns the row order; dragging writes the new order back through bind:data
    data: TData[]
  }

  let { columns, data = $bindable() }: Props = $props()

  let sorting = $state<SortingState>([])
  const dataIds = $derived(data.map((row) => row.id))

  const table = createTable({
    features: v9Features,
    get data() {
      return data
    },
    get columns() {
      return columns
    },
    getRowId: (row) => row.id,
    onSortingChange: (updater) => {
      sorting = typeof updater === 'function' ? updater(sorting) : updater
    },
    state: {
      get sorting() {
        return sorting
      },
    },
  })

  function arrayMove<T>(list: T[], from: number, to: number) {
    const next = [...list]
    next.splice(to, 0, next.splice(from, 1)[0])
    return next
  }

  // Reorder by row id, so it works the same whether or not a sort is active
  function moveRow(oldRenderedIndex: number, newRenderedIndex: number) {
    const rows = table.getRowModel().rows
    const oldIndex = dataIds.indexOf(rows[oldRenderedIndex].original.id)
    const newIndex = dataIds.indexOf(rows[newRenderedIndex].original.id)
    if (oldIndex === newIndex) return
    data = arrayMove(data, oldIndex, newIndex)
  }
</script>

<div class="overflow-hidden rounded-md border">
  <Table.Root>
    <Table.Header>
      {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
        <Table.Row>
          <Table.Head class="w-8" />
          {#each headerGroup.headers as header (header.id)}
            <Table.Head>
              <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
              <span
                class={header.column.getCanSort()
                  ? 'flex cursor-pointer select-none items-center gap-2'
                  : 'flex items-center gap-2'}
                onclick={header.column.getToggleSortingHandler()}
              >
                {#if !header.isPlaceholder}
                  <FlexRender {header} />
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
              </span>
            </Table.Head>
          {/each}
        </Table.Row>
      {/each}
    </Table.Header>
    <Table.Body {@attach sortable({ onMove: moveRow })}>
      {#each table.getRowModel().rows as row (row.id)}
        <Table.Row>
          <Table.Cell class="w-8">
            <button
              type="button"
              data-drag-handle
              class="cursor-grab text-muted-foreground active:cursor-grabbing"
              aria-label="Reorder row"
            >
              <GripVertical class="h-3.5 w-3.5" />
            </button>
          </Table.Cell>
          {#each row.getVisibleCells() as cell (cell.id)}
            <Table.Cell>
              <FlexRender {cell} />
            </Table.Cell>
          {/each}
        </Table.Row>
      {:else}
        <Table.Row>
          <Table.Cell colspan={columns.length + 1} class="h-24 text-center">
            No results.
          </Table.Cell>
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
