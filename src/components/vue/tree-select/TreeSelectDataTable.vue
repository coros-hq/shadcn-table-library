<script setup lang="ts" generic="TData extends { children?: TData[] }">
import { computed, ref } from 'vue'
import {
  FlexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import type {
  ColumnDef,
  ExpandedState,
  RowSelectionState,
  SortingState,
} from '@tanstack/vue-table'
import { ArrowDown, ArrowUp, ArrowUpDown } from '@lucide/vue'
import { valueUpdater } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const props = defineProps<{
  columns: ColumnDef<TData, any>[]
  data: TData[]
}>()

const sorting = ref<SortingState>([])
const expanded = ref<ExpandedState>(true)
const rowSelection = ref<RowSelectionState>({})

const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  getCoreRowModel: getCoreRowModel(),
  getSubRows: (row) => row.children,
  getFilteredRowModel: getFilteredRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  onExpandedChange: (updater) => valueUpdater(updater, expanded),
  onSortingChange: (updater) => valueUpdater(updater, sorting),
  onRowSelectionChange: (updater) => valueUpdater(updater, rowSelection),
  state: {
    get sorting() {
      return sorting.value
    },
    get expanded() {
      return expanded.value
    },
    get rowSelection() {
      return rowSelection.value
    },
  },
})

const selectedCount = computed(
  () => table.getSelectedRowModel().flatRows.length,
)
const totalCount = computed(() => table.getRowModel().flatRows.length)
</script>

<template>
  <div>
    <p class="mb-3 text-sm text-muted-foreground">
      {{ selectedCount }} of {{ totalCount }} rows selected
    </p>
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
              :tabindex="header.column.getCanSort() ? 0 : undefined"
              :role="header.column.getCanSort() ? 'button' : undefined"
              :class="header.column.getCanSort() ? 'cursor-pointer select-none' : undefined"
              @click="header.column.getCanSort() && header.column.getToggleSortingHandler()?.($event)"
              @keydown.enter.prevent="header.column.getCanSort() && header.column.getToggleSortingHandler()?.($event)"
              @keydown.space.prevent="header.column.getCanSort() && header.column.getToggleSortingHandler()?.($event)"
            >
              <div class="flex flex-row items-center gap-2">
                <FlexRender
                  v-if="!header.isPlaceholder"
                  :render="header.column.columnDef.header"
                  :props="header.getContext()"
                />
                <span v-if="header.column.getCanSort()">
                  <ArrowUp
                    v-if="header.column.getIsSorted() === 'asc'"
                    class="h-3 w-3"
                  />
                  <ArrowDown
                    v-else-if="header.column.getIsSorted() === 'desc'"
                    class="h-3 w-3"
                  />
                  <ArrowUpDown v-else class="h-3 w-3 opacity-50" />
                </span>
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="table.getRowModel().rows.length">
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
          </template>
          <TableRow v-else>
            <TableCell :colspan="columns.length" class="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
