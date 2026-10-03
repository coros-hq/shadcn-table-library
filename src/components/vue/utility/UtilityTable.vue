<script setup lang="ts" generic="TData">
import { ref } from 'vue'
import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import type { ColumnDef } from '@tanstack/vue-table'
import { FileSpreadsheet, FileText, Printer } from '@lucide/vue'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
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

const props = defineProps<{
  columns: ColumnDef<TData, any>[]
  data: TData[]
}>()

const density = ref<Density>('comfortable')

const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
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

<template>
  <div>
    <div
      class="mb-3 flex flex-wrap items-center justify-between gap-3 print:hidden"
    >
      <div class="flex items-center gap-2">
        <span class="text-sm text-muted-foreground">Density</span>
        <Select v-model="density">
          <SelectTrigger class="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="compact">Compact</SelectItem>
            <SelectItem value="comfortable">Comfortable</SelectItem>
            <SelectItem value="spacious">Spacious</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" @click="exportCsv">
          <FileText class="h-3.5 w-3.5" />
          CSV
        </Button>
        <Button type="button" variant="outline" size="sm" @click="exportExcel">
          <FileSpreadsheet class="h-3.5 w-3.5" />
          Excel
        </Button>
        <Button type="button" variant="outline" size="sm" @click="exportPdf">
          <Printer class="h-3.5 w-3.5" />
          PDF
        </Button>
      </div>
    </div>

    <div
      class="overflow-hidden rounded-md border print:border-black print:shadow-none"
    >
      <Table class="print:bg-white print:text-black">
        <TableHeader>
          <TableRow
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
            class="print:border-black"
          >
            <TableHead
              v-for="header in headerGroup.headers"
              :key="header.id"
              :class="
                cn(
                  densityHead[density],
                  'print:h-auto print:py-2 print:text-black',
                )
              "
            >
              <FlexRender
                v-if="!header.isPlaceholder"
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
            class="print:border-black"
          >
            <TableCell
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
              :class="cn(densityCell[density], 'print:py-1 print:text-black')"
            >
              <FlexRender
                :render="cell.column.columnDef.cell"
                :props="cell.getContext()"
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
