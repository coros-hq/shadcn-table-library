<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { AggregationType, PivotRow, SalesRecord } from './pivot'
import { pivotData } from './pivot'

const DIMENSIONS: { value: keyof SalesRecord; label: string }[] = [
  { value: 'region', label: 'Region' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'channel', label: 'Channel' },
]

const AGGREGATIONS: { value: AggregationType; label: string }[] = [
  { value: 'sum', label: 'Sum' },
  { value: 'avg', label: 'Average' },
  { value: 'count', label: 'Count' },
]

function formatValue(value: number, aggFn: AggregationType) {
  if (aggFn === 'count') return value.toLocaleString('en-US')
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
}

const props = defineProps<{ data: SalesRecord[] }>()

const rowDim = ref<keyof SalesRecord>('region')
const colDim = ref<keyof SalesRecord>('quarter')
const aggFn = ref<AggregationType>('sum')

const pivot = computed(() =>
  pivotData(props.data, rowDim.value, colDim.value, aggFn.value),
)

const rowLabel = computed(
  () => DIMENSIONS.find((d) => d.value === rowDim.value)!.label,
)

// Columns are derived from the pivot result, so they rebuild when the
// dimensions or the aggregate change.
const columns = computed<ColumnDef<PivotRow>[]>(() => [
  {
    id: 'rowValue',
    header: rowLabel.value,
    accessorKey: 'rowValue',
    cell: ({ getValue }) =>
      h('span', { class: 'font-medium' }, getValue() as string),
  },
  ...pivot.value.colValues.map(
    (colValue): ColumnDef<PivotRow> => ({
      id: colValue,
      header: colValue,
      accessorFn: (row) => row.cells[colValue],
      cell: ({ getValue }) => formatValue(getValue() as number, aggFn.value),
    }),
  ),
  {
    id: 'total',
    header: 'Total',
    accessorKey: 'total',
    cell: ({ getValue }) =>
      h(
        'span',
        { class: 'font-medium' },
        formatValue(getValue() as number, aggFn.value),
      ),
  },
])

const table = useVueTable({
  get data() {
    return pivot.value.rows
  },
  get columns() {
    return columns.value
  },
  getCoreRowModel: getCoreRowModel(),
})
</script>

<template>
  <div>
    <div class="mb-3 flex flex-wrap items-center gap-3">
      <div class="flex items-center gap-2">
        <span class="text-sm text-muted-foreground">Rows</span>
        <Select v-model="rowDim">
          <SelectTrigger class="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="d in DIMENSIONS.filter((d) => d.value !== colDim)"
              :key="d.value"
              :value="d.value"
            >
              {{ d.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm text-muted-foreground">Columns</span>
        <Select v-model="colDim">
          <SelectTrigger class="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="d in DIMENSIONS.filter((d) => d.value !== rowDim)"
              :key="d.value"
              :value="d.value"
            >
              {{ d.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm text-muted-foreground">Aggregate</span>
        <Select v-model="aggFn">
          <SelectTrigger class="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="a in AGGREGATIONS" :key="a.value" :value="a.value">
              {{ a.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
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
                v-if="!header.isPlaceholder"
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
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell v-for="colValue in pivot.colValues" :key="colValue">
              {{ formatValue(pivot.columnTotals[colValue], aggFn) }}
            </TableCell>
            <TableCell>{{ formatValue(pivot.grandTotal, aggFn) }}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  </div>
</template>
