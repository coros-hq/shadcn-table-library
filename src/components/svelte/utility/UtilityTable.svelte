<script lang="ts" generics="TData">
  import { getCoreRowModel, type ColumnDef } from '@tanstack/table-core'
  import FileSpreadsheet from '@lucide/svelte/icons/file-spreadsheet'
  import FileText from '@lucide/svelte/icons/file-text'
  import Printer from '@lucide/svelte/icons/printer'
  import {
    FlexRender,
    createSvelteTable,
  } from '$lib/components/ui/data-table/index.js'
  import * as Table from '$lib/components/ui/table/index.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import * as Select from '$lib/components/ui/select/index.js'
  import { cn } from '$lib/utils.js'
  import { downloadFile, toCsv, toExcelHtml } from './export'

  type Density = 'compact' | 'comfortable' | 'spacious'

  const densityCell: Record<Density, string> = {
    compact: 'py-1 text-xs',
    comfortable: 'py-2 text-sm',
    spacious: 'py-4 text-base',
  }

  const densityHead: Record<Density, string> = {
    compact: 'h-8 text-xs',
    comfortable: 'h-10 text-sm',
    spacious: 'h-14 text-base',
  }

  const densityLabel: Record<Density, string> = {
    compact: 'Compact',
    comfortable: 'Comfortable',
    spacious: 'Spacious',
  }

  type Props = {
    columns: ColumnDef<TData, any>[]
    data: TData[]
  }

  let { columns, data }: Props = $props()

  let density = $state<Density>('comfortable')

  const table = createSvelteTable({
    get data() {
      return data
    },
    get columns() {
      return columns
    },
    getCoreRowModel: getCoreRowModel(),
  })

  function getExportData() {
    const headers = table.getHeaderGroups()[0].headers.map((header) =>
      typeof header.column.columnDef.header === 'string'
        ? header.column.columnDef.header
        : header.column.id,
    )
    const rows = table
      .getRowModel()
      .rows.map((row) =>
        row.getVisibleCells().map((cell) => String(cell.getValue() ?? '')),
      )
    return { headers, rows }
  }

  function exportCsv() {
    const { headers, rows } = getExportData()
    downloadFile(toCsv(headers, rows), 'table-export.csv', 'text/csv;charset=utf-8;')
  }

  function exportExcel() {
    const { headers, rows } = getExportData()
    downloadFile(
      toExcelHtml(headers, rows),
      'table-export.xls',
      'application/vnd.ms-excel',
    )
  }

  function exportPdf() {
    window.print()
  }
</script>

<div>
  <div
    class="mb-3 flex flex-wrap items-center justify-between gap-3 print:hidden"
  >
    <div class="flex items-center gap-2">
      <span class="text-sm text-muted-foreground">Density</span>
      <Select.Root
        type="single"
        value={density}
        onValueChange={(next) => (density = next as Density)}
      >
        <Select.Trigger class="w-36">
          {densityLabel[density]}
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="compact" label="Compact">Compact</Select.Item>
          <Select.Item value="comfortable" label="Comfortable">
            Comfortable
          </Select.Item>
          <Select.Item value="spacious" label="Spacious">Spacious</Select.Item>
        </Select.Content>
      </Select.Root>
    </div>
    <div class="flex items-center gap-2">
      <Button type="button" variant="outline" size="sm" onclick={exportCsv}>
        <FileText class="h-3.5 w-3.5" />
        CSV
      </Button>
      <Button type="button" variant="outline" size="sm" onclick={exportExcel}>
        <FileSpreadsheet class="h-3.5 w-3.5" />
        Excel
      </Button>
      <Button type="button" variant="outline" size="sm" onclick={exportPdf}>
        <Printer class="h-3.5 w-3.5" />
        PDF
      </Button>
    </div>
  </div>

  <div
    class="overflow-hidden rounded-md border print:border-black print:shadow-none"
  >
    <Table.Root class="print:bg-white print:text-black">
      <Table.Header>
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row class="print:border-black">
            {#each headerGroup.headers as header (header.id)}
              <Table.Head
                class={cn(
                  densityHead[density],
                  'print:h-auto print:py-2 print:text-black',
                )}
              >
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
          <Table.Row class="print:border-black">
            {#each row.getVisibleCells() as cell (cell.id)}
              <Table.Cell class={cn(densityCell[density], 'print:py-1 print:text-black')}>
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
</div>
