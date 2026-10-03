<script setup lang="ts" generic="TData, TValue">
import { ref } from 'vue'
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  Table as VueTable,
} from '@tanstack/vue-table'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
} from '@lucide/vue'
import { valueUpdater } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const props = defineProps<{
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}>()

defineSlots<{
  // Rendered in the toolbar, next to the search input
  filters?: (props: { table: VueTable<TData> }) => unknown
}>()

const PAGE_SIZES = ['10', '20', '30', '40', '50']

const pagination = ref({ pageIndex: 0, pageSize: 10 })
const columnFilters = ref<ColumnFiltersState>([])
const globalFilter = ref('')
const sorting = ref<SortingState>([])

const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  onPaginationChange: (updater) => valueUpdater(updater, pagination),
  onSortingChange: (updater) => valueUpdater(updater, sorting),
  onColumnFiltersChange: (updater) => valueUpdater(updater, columnFilters),
  onGlobalFilterChange: (updater) => valueUpdater(updater, globalFilter),
  state: {
    get pagination() {
      return pagination.value
    },
    get sorting() {
      return sorting.value
    },
    get columnFilters() {
      return columnFilters.value
    },
    get globalFilter() {
      return globalFilter.value
    },
  },
})
</script>

<template>
  <div>
    <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
      <Input
        type="text"
        placeholder="Search..."
        class="filter-input w-full sm:w-64"
        @input="(e: Event) => table.setGlobalFilter((e.target as HTMLInputElement).value)"
      />
      <div class="flex flex-wrap items-center gap-2">
        <Button
          v-if="table.getState().columnFilters.length > 0"
          variant="link"
          class="underline"
          @click="table.resetColumnFilters()"
        >
          Clear Filters <X class="h-3 w-3" />
        </Button>
        <slot name="filters" :table="table" />
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

    <div class="mt-5 flex justify-end gap-1">
      <Button
        variant="outline"
        :disabled="!table.getCanPreviousPage()"
        @click="table.firstPage()"
      >
        <ChevronsLeft class="h-3 w-3" />
      </Button>
      <Button
        variant="outline"
        :disabled="!table.getCanPreviousPage()"
        @click="table.previousPage()"
      >
        <ChevronLeft class="h-3 w-3" />
      </Button>
      <Button
        variant="outline"
        :disabled="!table.getCanNextPage()"
        @click="table.nextPage()"
      >
        <ChevronRight class="h-3 w-3" />
      </Button>
      <Button
        variant="outline"
        :disabled="!table.getCanNextPage()"
        @click="table.lastPage()"
      >
        <ChevronsRight class="h-3 w-3" />
      </Button>
      <Select
        :model-value="pagination.pageSize.toString()"
        @update:model-value="(val) => table.setPageSize(Number(val))"
      >
        <SelectTrigger class="h-1/3">
          <SelectValue :placeholder="PAGE_SIZES[0]" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem v-for="size in PAGE_SIZES" :key="size" :value="size">
              {{ size }}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  </div>
</template>
