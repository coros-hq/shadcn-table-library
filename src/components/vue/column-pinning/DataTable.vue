<script setup lang="ts" generic="TData, TValue">
import { ref } from 'vue'
import type { CSSProperties } from 'vue'
import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import type {
  Column,
  ColumnDef,
  ColumnPinningState,
} from '@tanstack/vue-table'
import { valueUpdater, cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import PinControls from './PinControls.vue'

const props = defineProps<{
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  initialPinning?: ColumnPinningState
}>()

function getPinningStyles(column: Column<TData, unknown>): CSSProperties {
  const isPinned = column.getIsPinned()
  const size = column.getSize()
  return {
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    position: isPinned ? 'sticky' : 'relative',
    width: `${size}px`,
    minWidth: `${size}px`,
    maxWidth: `${size}px`,
    zIndex: isPinned ? 1 : 0,
  }
}

// Shadow on the edge that touches the scrolling columns
function pinShadow(column: Column<TData, unknown>) {
  const isPinned = column.getIsPinned()
  return cn(
    isPinned === 'left' &&
      column.getIsLastColumn('left') &&
      'shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)]',
    isPinned === 'right' &&
      column.getIsFirstColumn('right') &&
      'shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.15)]',
  )
}

const columnPinning = ref<ColumnPinningState>(props.initialPinning ?? {})

const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  getCoreRowModel: getCoreRowModel(),
  state: {
    get columnPinning() {
      return columnPinning.value
    },
  },
  onColumnPinningChange: (updater) => valueUpdater(updater, columnPinning),
  defaultColumn: { size: 160 },
})
</script>

<template>
  <div class="overflow-x-auto rounded-md border">
    <Table class="table-fixed" :style="{ width: `${table.getTotalSize()}px` }">
      <TableHeader>
        <TableRow
          v-for="headerGroup in table.getHeaderGroups()"
          :key="headerGroup.id"
        >
          <TableHead
            v-for="header in headerGroup.headers"
            :key="header.id"
            :class="cn('group/head bg-background', pinShadow(header.column))"
            :style="getPinningStyles(header.column)"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="truncate">
                <FlexRender
                  v-if="!header.isPlaceholder"
                  :render="header.column.columnDef.header"
                  :props="header.getContext()"
                />
              </span>
              <PinControls :column="header.column" />
            </div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="table.getRowModel().rows.length">
          <TableRow v-for="row in table.getRowModel().rows" :key="row.id">
            <TableCell
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
              :class="cn('truncate bg-background', pinShadow(cell.column))"
              :style="getPinningStyles(cell.column)"
            >
              <FlexRender
                :render="cell.column.columnDef.cell"
                :props="cell.getContext()"
              />
            </TableCell>
          </TableRow>
        </template>
        <TableRow v-else>
          <TableCell :colspan="columns.length" class="h-24 text-center">
            No results.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
