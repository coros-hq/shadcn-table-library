<script lang="ts" generics="TData extends RowData">
  import {
    FlexRender,
    createTable,
    type Column,
    type ColumnDef,
    type ColumnPinningState,
    type RowData,
  } from '@tanstack/svelte-table'
  import { v9Features, type V9Features } from '$lib/table-v9-features'
  import { cn } from '$lib/utils.js'
  import * as Table from '$lib/components/ui/table/index.js'
  import PinControls from './PinControls.svelte'

  type Props = {
    columns: ColumnDef<V9Features, TData, any>[]
    data: TData[]
    initialPinning?: ColumnPinningState
  }

  let { columns, data, initialPinning }: Props = $props()

  function getPinningStyles(column: Column<V9Features, TData, unknown>) {
    const isPinned = column.getIsPinned()
    const size = column.getSize()
    return [
      isPinned === 'start' && `left: ${column.getStart('start')}px`,
      isPinned === 'end' && `right: ${column.getAfter('end')}px`,
      `position: ${isPinned ? 'sticky' : 'relative'}`,
      `width: ${size}px`,
      `min-width: ${size}px`,
      `max-width: ${size}px`,
      `z-index: ${isPinned ? 1 : 0}`,
    ]
      .filter(Boolean)
      .join('; ')
  }

  // Shadow on the edge that touches the scrolling columns
  function pinShadow(column: Column<V9Features, TData, unknown>) {
    const isPinned = column.getIsPinned()
    return cn(
      isPinned === 'start' &&
        column.getIsLastColumn('start') &&
        'shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)]',
      isPinned === 'end' &&
        column.getIsFirstColumn('end') &&
        'shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.15)]',
    )
  }

  // svelte-ignore state_referenced_locally
  let columnPinning = $state<ColumnPinningState>(
    initialPinning ?? { start: [], end: [] },
  )

  const table = createTable({
    features: v9Features,
    get data() {
      return data
    },
    get columns() {
      return columns
    },
    state: {
      get columnPinning() {
        return columnPinning
      },
    },
    onColumnPinningChange: (updater) => {
      columnPinning =
        typeof updater === 'function' ? updater(columnPinning) : updater
    },
    defaultColumn: { size: 160 },
  })
</script>

<div class="overflow-x-auto rounded-md border">
  <Table.Root class="table-fixed" style="width: {table.getTotalSize()}px">
    <Table.Header>
      {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
        <Table.Row>
          {#each headerGroup.headers as header (header.id)}
            <Table.Head
              class={cn('group/head bg-background', pinShadow(header.column))}
              style={getPinningStyles(header.column)}
            >
              <div class="flex items-center justify-between gap-2">
                <span class="truncate">
                  {#if !header.isPlaceholder}
                    <FlexRender {header} />
                  {/if}
                </span>
                <PinControls column={header.column} />
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
            <Table.Cell
              class={cn('truncate bg-background', pinShadow(cell.column))}
              style={getPinningStyles(cell.column)}
            >
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
