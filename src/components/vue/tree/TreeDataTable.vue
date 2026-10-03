<script setup lang="ts" generic="TData extends { children?: TData[] }">
import { ref } from 'vue'
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
import { Input } from '@/components/ui/input'

const props = defineProps<{
  columns: ColumnDef<TData, any>[]
  data: TData[]
}>()

const sorting = ref<SortingState>([])
const globalFilter = ref('')
const expanded = ref<ExpandedState>(true)

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
  filterFromLeafRows: true,
  onExpandedChange: (updater) => valueUpdater(updater, expanded),
  onSortingChange: (updater) => valueUpdater(updater, sorting),
  onGlobalFilterChange: (updater) => valueUpdater(updater, globalFilter),
  state: {
    get sorting() {
      return sorting.value
    },
    get globalFilter() {
      return globalFilter.value
    },
    get expanded() {
      return expanded.value
    },
  },
})
</script>

<template>
  <div>
    <Input
      type="text"
      placeholder="Search..."
      class="mb-3 w-64"
      @input="(e: Event) => table.setGlobalFilter((e.target as HTMLInputElement).value)"
    />
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
              @click="header.column.getToggleSortingHandler()?.($event)"
              @keydown.enter.prevent="header.column.getToggleSortingHandler()?.($event)"
              @keydown.space.prevent="header.column.getToggleSortingHandler()?.($event)"
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
            <TableRow v-for="row in table.getRowModel().rows" :key="row.id">
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
