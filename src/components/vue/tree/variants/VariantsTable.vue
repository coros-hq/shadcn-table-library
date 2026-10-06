<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  FlexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import type {
  ColumnDef,
  ExpandedState,
  RowSelectionState,
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
import type { Product } from './data'

const props = defineProps<{
  columns: ColumnDef<Product, any>[]
  data: Product[]
}>()

const expanded = ref<ExpandedState>({})
const rowSelection = ref<RowSelectionState>({})

const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  getRowId: (row) => row.id,
  getCoreRowModel: getCoreRowModel(),
  getSubRows: (row) => row.variants,
  getExpandedRowModel: getExpandedRowModel(),
  // Only products are selectable; ticking one must not tick its variants
  enableRowSelection: (row) => row.depth === 0,
  enableSubRowSelection: false,
  onExpandedChange: (updater) => valueUpdater(updater, expanded),
  onRowSelectionChange: (updater) => valueUpdater(updater, rowSelection),
  state: {
    get expanded() {
      return expanded.value
    },
    get rowSelection() {
      return rowSelection.value
    },
  },
})

const selected = computed(() => Object.keys(rowSelection.value).length)

// Drop the rules inside an open group so the bracket reads as one line
function isLastVariant(row: { depth: number; index: number; getParentRow: () => { subRows: unknown[] } | undefined }) {
  const siblings = row.getParentRow()?.subRows ?? []
  return row.depth > 0 && row.index === siblings.length - 1
}
</script>

<template>
  <div>
    <div class="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
          >
            <TableHead
              v-for="header in headerGroup.headers"
              :key="header.id"
              :style="{ width: `${header.column.columnDef.size}px` }"
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
            :data-state="row.getIsSelected() ? 'selected' : undefined"
            :class="
              cn(
                (row.getIsExpanded() || (row.depth > 0 && !isLastVariant(row))) &&
                  'border-b-0',
                row.depth > 0 && 'bg-muted/30 hover:bg-muted/30',
              )
            "
          >
            <TableCell
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
              class="relative py-3"
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
    <p class="mt-3 text-sm text-muted-foreground" aria-live="polite">
      {{ selected }} of {{ data.length }} products selected
    </p>
  </div>
</template>
