<script lang="ts">
  import {
    FlexRender,
    createTable,
    type ColumnDef,
  } from '@tanstack/svelte-table'
  import { v9Features, type V9Features } from '$lib/table-v9-features'
  import ChevronLeft from '@lucide/svelte/icons/chevron-left'
  import ChevronRight from '@lucide/svelte/icons/chevron-right'
  import Download from '@lucide/svelte/icons/download'
  import * as Table from '$lib/components/ui/table/index.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import type { Order } from './columns'
  import { applyExportConfig, defaultExportConfig } from './export-config'
  import type { ExportConfig } from './export-config'
  import ExportDialog from './ExportDialog.svelte'
  import { downloadFile, toCsv, toExcelHtml } from './export'

  type Props = {
    columns: ColumnDef<V9Features, Order, any>[]
    data: Order[]
    today: Date
  }

  let { columns, data, today }: Props = $props()

  const table = createTable({
    features: v9Features,
    get data() {
      return data
    },
    get columns() {
      return columns
    },
    initialState: { pagination: { pageIndex: 0, pageSize: 8 } },
  })

  // The column list for the dialog comes from the table, not a second list
  const exportColumns = $derived(
    table.getAllLeafColumns().map((column) => ({
      id: column.id,
      label:
        typeof column.columnDef.header === 'string'
          ? column.columnDef.header
          : column.id,
    })),
  )

  let open = $state(false)
  // svelte-ignore state_referenced_locally
  let config = $state<ExportConfig>(
    defaultExportConfig(exportColumns.map((c) => c.id)),
  )

  const matches = $derived(applyExportConfig(data, config, today))

  function resetConfig() {
    config = defaultExportConfig(exportColumns.map((c) => c.id))
  }

  function handleExport() {
    const chosen = exportColumns.filter((c) => config.columns.includes(c.id))
    const headers = chosen.map((c) => c.label)
    // Export raw values (e.g. 129.5, not "$129.50") so spreadsheets can sum them
    const rows = matches.map((order) =>
      chosen.map((c) => String(order[c.id as keyof Order])),
    )

    if (config.format === 'csv') {
      downloadFile(toCsv(headers, rows), 'orders.csv', 'text/csv;charset=utf-8;')
    } else {
      downloadFile(
        toExcelHtml(headers, rows),
        'orders.xls',
        'application/vnd.ms-excel',
      )
    }
    open = false
  }

  const pagination = $derived(table.atoms.pagination.get())
</script>

<div class="space-y-3">
  <div class="flex items-center justify-between gap-3">
    <p class="text-sm text-muted-foreground">{data.length} orders</p>
    <Button type="button" variant="outline" size="sm" onclick={() => (open = true)}>
      <Download class="size-3.5" />
      Export…
    </Button>
  </div>

  <div class="overflow-hidden rounded-md border">
    <Table.Root>
      <Table.Header>
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row>
            {#each headerGroup.headers as header (header.id)}
              <Table.Head>
                <FlexRender {header} />
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
        {/each}
      </Table.Body>
    </Table.Root>
  </div>

  <div class="flex items-center justify-end gap-2">
    <p class="mr-auto text-sm text-muted-foreground tabular-nums">
      {pagination.pageIndex * pagination.pageSize + 1}–{Math.min(
        (pagination.pageIndex + 1) * pagination.pageSize,
        data.length,
      )}
      of {data.length}
    </p>
    <Button
      type="button"
      variant="outline"
      size="icon"
      class="size-8"
      aria-label="Previous page"
      disabled={!table.getCanPreviousPage()}
      onclick={() => table.previousPage()}
    >
      <ChevronLeft class="size-4" />
    </Button>
    <Button
      type="button"
      variant="outline"
      size="icon"
      class="size-8"
      aria-label="Next page"
      disabled={!table.getCanNextPage()}
      onclick={() => table.nextPage()}
    >
      <ChevronRight class="size-4" />
    </Button>
  </div>

  <ExportDialog
    bind:open
    bind:config
    columns={exportColumns}
    matchCount={matches.length}
    total={data.length}
    onreset={resetConfig}
    onexport={handleExport}
  />
</div>
