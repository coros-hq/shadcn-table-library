<script lang="ts">
  import {
    getCoreRowModel,
    getPaginationRowModel,
    type ColumnDef,
    type RowSelectionState,
  } from '@tanstack/table-core'
  import ChevronLeft from '@lucide/svelte/icons/chevron-left'
  import ChevronRight from '@lucide/svelte/icons/chevron-right'
  import Download from '@lucide/svelte/icons/download'
  import { cn } from '$lib/utils.js'
  import {
    FlexRender,
    createSvelteTable,
  } from '$lib/components/ui/data-table/index.js'
  import * as Table from '$lib/components/ui/table/index.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import type { Customer } from './columns'
  import { downloadFile, toCsv, toExcelHtml } from './export'

  type ExportFormat = 'csv' | 'excel'

  type Props = {
    columns: ColumnDef<Customer, any>[]
    data: Customer[]
  }

  let { columns, data }: Props = $props()

  let rowSelection = $state<RowSelectionState>({})
  let format = $state<ExportFormat>('csv')

  const table = createSvelteTable({
    get data() {
      return data
    },
    get columns() {
      return columns
    },
    // Stable ids keep a selection attached to the same customer across pages
    getRowId: (row) => row.id,
    state: {
      get rowSelection() {
        return rowSelection
      },
    },
    onRowSelectionChange: (updater) => {
      rowSelection =
        typeof updater === 'function' ? updater(rowSelection) : updater
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  })

  // Covers every page, not just the rows currently rendered
  const selectedRows = $derived(table.getSelectedRowModel().rows)
  const selectedCount = $derived(selectedRows.length)
  const allPageSelected = $derived(table.getIsAllPageRowsSelected())
  const pagination = $derived(table.getState().pagination)

  function handleExport() {
    const exportColumns = table
      .getAllLeafColumns()
      .filter((column) => column.id !== 'select')
    const headers = exportColumns.map((column) =>
      typeof column.columnDef.header === 'string'
        ? column.columnDef.header
        : column.id,
    )
    // Raw values (4200, not "$4,200") so spreadsheets can sum them
    const rows = selectedRows.map((row) =>
      exportColumns.map((column) => String(row.getValue(column.id) ?? '')),
    )

    if (format === 'csv') {
      downloadFile(toCsv(headers, rows), 'customers.csv', 'text/csv;charset=utf-8;')
    } else {
      downloadFile(
        toExcelHtml(headers, rows),
        'customers.xls',
        'application/vnd.ms-excel',
      )
    }
  }
</script>

<div class="space-y-3">
  <div class="flex flex-wrap items-center justify-between gap-3">
    <div class="flex min-h-8 items-center gap-2 text-sm" aria-live="polite">
      {#if selectedCount === 0}
        <span class="text-muted-foreground">Select rows to export them</span>
      {:else}
        <span class="tabular-nums">
          <span class="font-medium">{selectedCount}</span>
          <span class="text-muted-foreground"> of {data.length} selected</span>
        </span>
        {#if allPageSelected && selectedCount < data.length}
          <Button
            type="button"
            variant="link"
            size="sm"
            class="h-auto px-0"
            onclick={() => table.toggleAllRowsSelected(true)}
          >
            Select all {data.length}
          </Button>
        {/if}
        <Button
          type="button"
          variant="link"
          size="sm"
          class="h-auto px-0 text-muted-foreground"
          onclick={() => table.resetRowSelection()}
        >
          Clear
        </Button>
      {/if}
    </div>

    <div class="flex items-center gap-2">
      <div class="inline-flex rounded-md border p-0.5" role="group" aria-label="Export format">
        {#each ['csv', 'excel'] as const as value (value)}
          <button
            type="button"
            aria-pressed={format === value}
            class={cn(
              'rounded-sm px-2.5 py-0.5 text-sm transition-colors',
              format === value
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
            onclick={() => (format = value)}
          >
            {value === 'csv' ? 'CSV' : 'Excel'}
          </button>
        {/each}
      </div>
      <Button
        type="button"
        size="sm"
        disabled={selectedCount === 0}
        onclick={handleExport}
      >
        <Download class="size-3.5" />
        Export{selectedCount > 0 ? ` ${selectedCount}` : ''} selected
      </Button>
    </div>
  </div>

  <div class="overflow-hidden rounded-md border">
    <Table.Root>
      <Table.Header>
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row>
            {#each headerGroup.headers as header (header.id)}
              <Table.Head class={cn(header.column.id === 'select' && 'w-10')}>
                <FlexRender
                  content={header.column.columnDef.header}
                  context={header.getContext()}
                />
              </Table.Head>
            {/each}
          </Table.Row>
        {/each}
      </Table.Header>
      <Table.Body>
        {#each table.getRowModel().rows as row (row.id)}
          <Table.Row data-state={row.getIsSelected() ? 'selected' : undefined}>
            {#each row.getVisibleCells() as cell (cell.id)}
              <Table.Cell>
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
</div>
