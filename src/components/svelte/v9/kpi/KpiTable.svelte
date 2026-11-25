<script lang="ts">
  import {
    FlexRender,
    createTable,
    type ColumnDef,
  } from '@tanstack/svelte-table'
  import { v9Features, type V9Features } from '$lib/table-v9-features'
  import * as Table from '$lib/components/ui/table/index.js'
  import type { Kpi } from './kpi'

  let { columns, data }: { columns: ColumnDef<V9Features, Kpi, any>[]; data: Kpi[] } = $props()

  const table = createTable({
    features: v9Features,
    get data() {
      return data
    },
    get columns() {
      return columns
    },
  })
</script>

<div class="overflow-hidden rounded-md border">
  <Table.Root>
    <Table.Header>
      {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
        <Table.Row>
          {#each headerGroup.headers as header (header.id)}
            <Table.Head class="h-8 text-xs">
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
            <Table.Cell class="py-2">
              <FlexRender {cell} />
            </Table.Cell>
          {/each}
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
