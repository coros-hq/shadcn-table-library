<script setup lang="ts" generic="TData, TValue">
import { ref } from 'vue'
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import type { ColumnDef, ColumnFiltersState } from '@tanstack/vue-table'
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
import ToolbarSelect from './ToolbarSelect.vue'

interface FilterOption {
  value: string
  label: string
}

const props = defineProps<{
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  categoryOptions: FilterOption[]
  statusOptions: FilterOption[]
}>()

const columnFilters = ref<ColumnFiltersState>([])
const globalFilter = ref('')

const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  onColumnFiltersChange: (updater) => valueUpdater(updater, columnFilters),
  onGlobalFilterChange: (updater) => valueUpdater(updater, globalFilter),
  state: {
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
    <div class="mb-3 flex flex-wrap items-center gap-2">
      <Input
        v-model="globalFilter"
        placeholder="Search tasks..."
        class="w-full sm:w-64"
      />
      <ToolbarSelect
        :column="table.getColumn('category')"
        placeholder="Category"
        :options="categoryOptions"
      />
      <ToolbarSelect
        :column="table.getColumn('status')"
        placeholder="Status"
        :options="statusOptions"
      />
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
