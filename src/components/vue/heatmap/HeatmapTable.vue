<script setup lang="ts">
import { computed, h } from 'vue'
import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import type { ColumnDef } from '@tanstack/vue-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { HeatmapRow } from './heatmap'
import { getHeatColor, getHeatmapRange } from './heatmap'

const props = withDefaults(
  defineProps<{
    columns: string[]
    data: HeatmapRow[]
    formatValue?: (value: number) => string
  }>(),
  { formatValue: (value: number) => String(value) },
)

const range = computed(() => getHeatmapRange(props.data, props.columns))

const tableColumns = computed<ColumnDef<HeatmapRow>[]>(() => [
  {
    id: 'label',
    header: '',
    accessorKey: 'label',
    cell: ({ getValue }) =>
      h('span', { class: 'font-medium' }, getValue() as string),
  },
  ...props.columns.map(
    (col): ColumnDef<HeatmapRow> => ({
      id: col,
      header: col,
      accessorFn: (row) => row.values[col],
      cell: ({ getValue }) => {
        const value = getValue() as number
        const { backgroundColor, isDark } = getHeatColor(
          value,
          range.value.min,
          range.value.max,
        )
        return h(
          'div',
          {
            style: { backgroundColor },
            class: cn(
              'flex h-full w-full items-center justify-center px-3 py-2.5 text-sm tabular-nums',
              isDark ? 'text-white' : 'text-foreground',
            ),
          },
          props.formatValue(value),
        )
      },
    }),
  ),
])

const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return tableColumns.value
  },
  getCoreRowModel: getCoreRowModel(),
})

const legend = computed(() => ({
  low: getHeatColor(range.value.min, range.value.min, range.value.max)
    .backgroundColor,
  high: getHeatColor(range.value.max, range.value.min, range.value.max)
    .backgroundColor,
}))
</script>

<template>
  <div>
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
              class="text-center"
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
          <TableRow v-for="row in table.getRowModel().rows" :key="row.id">
            <TableCell
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
              :class="cell.column.id === 'label' ? undefined : 'p-0 text-center'"
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
    <div class="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
      <span>{{ formatValue(range.min) }}</span>
      <div
        class="h-2 flex-1 rounded-full"
        :style="{
          background: `linear-gradient(to right, ${legend.low}, ${legend.high})`,
        }"
      />
      <span>{{ formatValue(range.max) }}</span>
    </div>
  </div>
</template>
