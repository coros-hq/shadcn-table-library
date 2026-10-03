<script setup lang="ts">
import { ref } from 'vue'
import {
  FlexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import type { ExpandedState, SortingState } from '@tanstack/vue-table'
import { ArrowDown, ArrowUp, ArrowUpDown } from '@lucide/vue'
import { valueUpdater } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { InventoryTableMeta, SkuRow } from './columns'
import { columns } from './columns'
import BatchDetail from './BatchDetail.vue'

const props = defineProps<{
  data: SkuRow[]
  meta: InventoryTableMeta
}>()

const sorting = ref<SortingState>([{ id: 'status', desc: false }])
const expanded = ref<ExpandedState>({ 'SKU-1042': true })

const table = useVueTable({
  get data() {
    return props.data
  },
  columns,
  get meta() {
    return props.meta
  },
  state: {
    get sorting() {
      return sorting.value
    },
    get expanded() {
      return expanded.value
    },
  },
  onSortingChange: (updater) => valueUpdater(updater, sorting),
  onExpandedChange: (updater) => valueUpdater(updater, expanded),
  // Rows are keyed by SKU, not array index, so expansion follows the SKU
  // when a formula-backed sort (e.g. Status) moves it after an edit.
  getRowId: (row) => row.sku,
  // Batches aren't subRows of the same shape — the detail panel is custom
  // markup — so every row can expand without a getSubRows.
  getRowCanExpand: () => true,
  // Every edit produces a new `data` array; without this, TanStack would
  // collapse all rows each time a cell is saved.
  autoResetExpanded: false,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
})
</script>

<template>
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
            :aria-sort="
              header.column.getIsSorted() === 'asc'
                ? 'ascending'
                : header.column.getIsSorted() === 'desc'
                  ? 'descending'
                  : undefined
            "
            class="whitespace-nowrap"
          >
            <template v-if="!header.isPlaceholder">
              <button
                v-if="header.column.getCanSort()"
                type="button"
                class="flex items-center gap-2"
                @click="header.column.getToggleSortingHandler()?.($event)"
              >
                <FlexRender
                  :render="header.column.columnDef.header"
                  :props="header.getContext()"
                />
                <ArrowUp
                  v-if="header.column.getIsSorted() === 'asc'"
                  class="size-3"
                />
                <ArrowDown
                  v-else-if="header.column.getIsSorted() === 'desc'"
                  class="size-3"
                />
                <ArrowUpDown v-else class="size-3 opacity-50" />
              </button>
              <FlexRender
                v-else
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </template>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="table.getRowModel().rows.length">
          <template v-for="row in table.getRowModel().rows" :key="row.id">
            <TableRow :data-state="row.getIsExpanded() ? 'selected' : undefined">
              <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                <FlexRender
                  :render="cell.column.columnDef.cell"
                  :props="cell.getContext()"
                />
              </TableCell>
            </TableRow>
            <TableRow v-if="row.getIsExpanded()" class="hover:bg-transparent">
              <TableCell
                :colspan="table.getVisibleLeafColumns().length"
                class="bg-muted/30 p-4"
              >
                <BatchDetail :row="row.original" :meta="meta" />
              </TableCell>
            </TableRow>
          </template>
        </template>
        <TableRow v-else>
          <TableCell
            :colspan="table.getVisibleLeafColumns().length"
            class="h-24 text-center"
          >
            No results.
          </TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow
          v-for="footerGroup in table.getFooterGroups()"
          :key="footerGroup.id"
        >
          <TableCell
            v-for="header in footerGroup.headers"
            :key="header.id"
            class="font-medium"
          >
            <FlexRender
              :render="header.column.columnDef.footer"
              :props="header.getContext()"
            />
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  </div>
</template>
