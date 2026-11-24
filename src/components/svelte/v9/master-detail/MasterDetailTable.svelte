<script lang="ts">
  import {
    FlexRender,
    createTable,
    renderComponent,
    type ColumnDef,
  } from '@tanstack/svelte-table'
  import { v9Features, type V9Features } from '$lib/table-v9-features'
  import * as Table from '$lib/components/ui/table/index.js'
  import ExpanderCell from './ExpanderCell.svelte'
  import OrderDetail from './OrderDetail.svelte'
  import type { Order } from './columns'

  type Props = {
    columns: ColumnDef<V9Features, Order, any>[]
    data: Order[]
  }

  let { columns, data }: Props = $props()

  let expandedRows = $state<Set<string>>(new Set())

  function toggleRow(id: string) {
    const next = new Set(expandedRows)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    expandedRows = next
  }

  // The expander cell reads `expandedRows` while rendering, so only the
  // affected rows update when one is toggled.
  const allColumns = $derived<ColumnDef<V9Features, Order, any>[]>([
    {
      id: 'expander',
      header: () => null,
      cell: ({ row }) =>
        renderComponent(ExpanderCell, {
          expanded: expandedRows.has(row.original.id),
          ontoggle: () => toggleRow(row.original.id),
        }),
    },
    ...columns,
  ])

  const table = createTable({
    features: v9Features,
    get data() {
      return data
    },
    get columns() {
      return allColumns
    },
  })
</script>

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
        <Table.Row
          data-state={expandedRows.has(row.original.id) ? 'expanded' : undefined}
        >
          {#each row.getVisibleCells() as cell (cell.id)}
            <Table.Cell>
              <FlexRender {cell} />
            </Table.Cell>
          {/each}
        </Table.Row>
        {#if expandedRows.has(row.original.id)}
          <Table.Row>
            <Table.Cell colspan={allColumns.length} class="bg-muted/30 p-4">
              <OrderDetail order={row.original} />
            </Table.Cell>
          </Table.Row>
        {/if}
      {:else}
        <Table.Row>
          <Table.Cell colspan={allColumns.length} class="h-24 text-center">
            No results.
          </Table.Cell>
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
