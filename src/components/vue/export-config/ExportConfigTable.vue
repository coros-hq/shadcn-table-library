<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  FlexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import type { ColumnDef } from '@tanstack/vue-table'
import { ChevronLeft, ChevronRight, Download } from '@lucide/vue'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import type { Order } from './columns'
import { applyExportConfig, defaultExportConfig } from './export-config'
import type { ExportConfig } from './export-config'
import ExportDialog from './ExportDialog.vue'
import { downloadFile, toCsv, toExcelHtml } from './export'

const props = defineProps<{
  columns: ColumnDef<Order, any>[]
  data: Order[]
  today: Date
}>()

const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  initialState: { pagination: { pageSize: 8 } },
})

// The column list for the dialog comes from the table, not a second list
const exportColumns = computed(() =>
  table.getAllLeafColumns().map((column) => ({
    id: column.id,
    label:
      typeof column.columnDef.header === 'string'
        ? column.columnDef.header
        : column.id,
  })),
)

const open = ref(false)
const config = ref<ExportConfig>(
  defaultExportConfig(exportColumns.value.map((c) => c.id)),
)

const matches = computed(() =>
  applyExportConfig(props.data, config.value, props.today),
)

function resetConfig() {
  config.value = defaultExportConfig(exportColumns.value.map((c) => c.id))
}

function handleExport() {
  const chosen = exportColumns.value.filter((c) =>
    config.value.columns.includes(c.id),
  )
  const headers = chosen.map((c) => c.label)
  // Export raw values (e.g. 129.5, not "$129.50") so spreadsheets can sum them
  const rows = matches.value.map((order) =>
    chosen.map((c) => String(order[c.id as keyof Order])),
  )

  if (config.value.format === 'csv') {
    downloadFile(toCsv(headers, rows), 'orders.csv', 'text/csv;charset=utf-8;')
  } else {
    downloadFile(
      toExcelHtml(headers, rows),
      'orders.xls',
      'application/vnd.ms-excel',
    )
  }
  open.value = false
}

const pagination = computed(() => table.getState().pagination)
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between gap-3">
      <p class="text-sm text-muted-foreground">{{ data.length }} orders</p>
      <Button type="button" variant="outline" size="sm" @click="open = true">
        <Download class="size-3.5" />
        Export…
      </Button>
    </div>

    <div class="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
          >
            <TableHead v-for="header in headerGroup.headers" :key="header.id">
              <FlexRender
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="row in table.getRowModel().rows" :key="row.id">
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

    <ExportDialog
      v-model:open="open"
      v-model:config="config"
      :columns="exportColumns"
      :match-count="matches.length"
      :total="data.length"
      @reset="resetConfig"
      @export="handleExport"
    />
  </div>
</template>
