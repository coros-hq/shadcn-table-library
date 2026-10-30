<script lang="ts">
  import { getCoreRowModel, type ColumnDef } from '@tanstack/table-core'
  import {
    FlexRender,
    createSvelteTable,
    renderComponent,
  } from '$lib/components/ui/data-table/index.js'
  import * as Table from '$lib/components/ui/table/index.js'
  import ExpanderCell from './ExpanderCell.svelte'
  import OrderDetail from './OrderDetail.svelte'
  import type { Order } from './columns'

  type Props = {
    columns: ColumnDef<Order, any>[]
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
  const allColumns = $derived<ColumnDef<Order, any>[]>([
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

  const table = createSvelteTable({
    get data() {
      return data
    },
    get columns() {
      return allColumns
    },
    getCoreRowModel: getCoreRowModel(),
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
          data-state={expandedRows.has(row.original.id) ? 'expanded' : undefined}
        >
          {#each row.getVisibleCells() as cell (cell.id)}
            <Table.Cell>
              <FlexRender
                content={cell.column.columnDef.cell}
                context={cell.getContext()}
              />
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
