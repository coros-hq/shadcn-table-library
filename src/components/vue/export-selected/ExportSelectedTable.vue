<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  FlexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import type { ColumnDef, RowSelectionState } from '@tanstack/vue-table'
import { ChevronLeft, ChevronRight, Download } from '@lucide/vue'
import { cn, valueUpdater } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import type { Customer } from './columns'
import { downloadFile, toCsv, toExcelHtml } from './export'

type ExportFormat = 'csv' | 'excel'

const props = defineProps<{
  columns: ColumnDef<Customer, any>[]
  data: Customer[]
}>()

const rowSelection = ref<RowSelectionState>({})
const format = ref<ExportFormat>('csv')

const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  // Stable ids keep a selection attached to the same customer across pages
  getRowId: (row) => row.id,
  state: {
    get rowSelection() {
      return rowSelection.value
    },
  },
  onRowSelectionChange: (updater) => valueUpdater(updater, rowSelection),
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  initialState: { pagination: { pageSize: 8 } },
})

// Covers every page, not just the rows currently rendered
const selectedRows = computed(() => table.getSelectedRowModel().rows)
const selectedCount = computed(() => selectedRows.value.length)
const allPageSelected = computed(() => table.getIsAllPageRowsSelected())
const pagination = computed(() => table.getState().pagination)

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
  const rows = selectedRows.value.map((row) =>
    exportColumns.map((column) => String(row.getValue(column.id) ?? '')),
  )

  if (format.value === 'csv') {
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

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex min-h-8 items-center gap-2 text-sm" aria-live="polite">
        <span v-if="selectedCount === 0" class="text-muted-foreground">
          Select rows to export them
        </span>
        <template v-else>
          <span class="tabular-nums">
            <span class="font-medium">{{ selectedCount }}</span>
            <span class="text-muted-foreground"> of {{ data.length }} selected</span>
          </span>
          <Button
            v-if="allPageSelected && selectedCount < data.length"
            type="button"
            variant="link"
            size="sm"
            class="h-auto px-0"
            @click="table.toggleAllRowsSelected(true)"
          >
            Select all {{ data.length }}
          </Button>
          <Button
            type="button"
            variant="link"
            size="sm"
            class="h-auto px-0 text-muted-foreground"
            @click="table.resetRowSelection()"
          >
            Clear
          </Button>
        </template>
      </div>

      <div class="flex items-center gap-2">
        <div
          class="inline-flex rounded-md border p-0.5"
          role="group"
          aria-label="Export format"
        >
          <button
            v-for="value in (['csv', 'excel'] as ExportFormat[])"
            :key="value"
            type="button"
            :aria-pressed="format === value"
            :class="
              cn(
                'rounded-sm px-2.5 py-0.5 text-sm transition-colors',
                format === value
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )
            "
            @click="format = value"
          >
            {{ value === 'csv' ? 'CSV' : 'Excel' }}
          </button>
        </div>
        <Button
          type="button"
          size="sm"
          :disabled="selectedCount === 0"
          @click="handleExport"
        >
          <Download class="size-3.5" />
          Export{{ selectedCount > 0 ? ` ${selectedCount}` : '' }} selected
        </Button>
      </div>
    </div>

    <div class="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
          >
            <TableHead
              v-for="header in headerGroup.headers"
              :key="header.id"
              :class="cn(header.column.id === 'select' && 'w-10')"
            >
              <FlexRender
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            :data-state="row.getIsSelected() ? 'selected' : undefined"
          >
            <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
              <FlexRender
                :render="cell.column.columnDef.cell"
                :props="cell.getContext()"
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <div class="flex items-center justify-end gap-2">
      <p class="mr-auto text-sm text-muted-foreground tabular-nums">
        {{ pagination.pageIndex * pagination.pageSize + 1 }}–{{
          Math.min((pagination.pageIndex + 1) * pagination.pageSize, data.length)
        }}
        of {{ data.length }}
      </p>
      <Button
        type="button"
        variant="outline"
        size="icon"
        class="size-8"
        aria-label="Previous page"
        :disabled="!table.getCanPreviousPage()"
        @click="table.previousPage()"
      >
        <ChevronLeft class="size-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        class="size-8"
        aria-label="Next page"
        :disabled="!table.getCanNextPage()"
        @click="table.nextPage()"
      >
        <ChevronRight class="size-4" />
      </Button>
    </div>
  </div>
</template>
