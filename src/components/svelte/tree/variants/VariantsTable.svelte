<script lang="ts">
  import {
    getCoreRowModel,
    getExpandedRowModel,
    type ColumnDef,
    type ExpandedState,
    type RowSelectionState,
  } from '@tanstack/table-core'
  import {
    FlexRender,
    createSvelteTable,
  } from '$lib/components/ui/data-table/index.js'
  import * as Table from '$lib/components/ui/table/index.js'
  import { cn } from '$lib/utils.js'
  import type { Product } from './data'

  type Props = {
    columns: ColumnDef<Product, any>[]
    data: Product[]
  }

  let { columns, data }: Props = $props()

  let expanded = $state<ExpandedState>({})
  let rowSelection = $state<RowSelectionState>({})

  const table = createSvelteTable({
    get data() {
      return data
    },
    get columns() {
      return columns
    },
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSubRows: (row) => row.variants,
    getExpandedRowModel: getExpandedRowModel(),
    // Only products are selectable; ticking one must not tick its variants
    enableRowSelection: (row) => row.depth === 0,
    enableSubRowSelection: false,
    onExpandedChange: (updater) => {
      expanded = typeof updater === 'function' ? updater(expanded) : updater
    },
    onRowSelectionChange: (updater) => {
      rowSelection =
        typeof updater === 'function' ? updater(rowSelection) : updater
    },
    state: {
      get expanded() {
        return expanded
      },
      get rowSelection() {
        return rowSelection
      },
    },
  })

  const selected = $derived(Object.keys(rowSelection).length)

  // Drop the rules inside an open group so the bracket reads as one line
  function isLastVariant(row: {
    depth: number
    index: number
    getParentRow: () => { subRows: unknown[] } | undefined
  }) {
    const siblings = row.getParentRow()?.subRows ?? []
    return row.depth > 0 && row.index === siblings.length - 1
  }
</script>

<div>
  <div class="overflow-x-auto rounded-md border">
    <Table.Root>
      <Table.Header>
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row>
            {#each headerGroup.headers as header (header.id)}
              <Table.Head style="width: {header.column.columnDef.size}px">
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
          <Table.Row
            data-state={row.getIsSelected() ? 'selected' : undefined}
            class={cn(
              (row.getIsExpanded() || (row.depth > 0 && !isLastVariant(row))) &&
                'border-b-0',
              row.depth > 0 && 'bg-muted/30 hover:bg-muted/30',
            )}
          >
            {#each row.getVisibleCells() as cell (cell.id)}
              <Table.Cell class="relative py-3">
                <FlexRender
                  content={cell.column.columnDef.cell}
                  context={cell.getContext()}
                />
              </Table.Cell>
            {/each}
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
  <p class="mt-3 text-sm text-muted-foreground" aria-live="polite">
    {selected} of {data.length} products selected
  </p>
</div>
