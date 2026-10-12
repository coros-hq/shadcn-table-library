<script setup lang="ts" generic="TValue">
import { computed, ref } from 'vue'
import {
  FlexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import type { ColumnDef, FilterFn, SortingState } from '@tanstack/vue-table'
import { ArrowDown, ArrowUp, ArrowUpDown, X } from '@lucide/vue'
import { valueUpdater } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import ColumnMultiSelect from './ColumnMultiSelect.vue'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Employee } from './data'

const props = defineProps<{
  columns: ColumnDef<Employee, TValue>[]
  data: Employee[]
  departments: string[]
  statuses: string[]
}>()

// Searches the fields a person would actually type: name, email, role,
// department and location — not just the columns that happen to be strings.
const employeeSearch: FilterFn<Employee> = (row, _columnId, value) => {
  const query = String(value).trim().toLowerCase()
  if (!query) return true
  const { name, email, role, department, location } = row.original
  return [name, email, role, department, location].some((field) =>
    field.toLowerCase().includes(query),
  )
}

type Density = 'compact' | 'comfortable' | 'spacious'

// Padding and type size live on the cells, so every column follows the toggle
// without its own cell renderer knowing about density.
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

const density = ref<Density>('comfortable')
const sorting = ref<SortingState>([])
const globalFilter = ref('')

const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getFacetedRowModel: getFacetedRowModel(),
  getFacetedUniqueValues: getFacetedUniqueValues(),
  getPaginationRowModel: getPaginationRowModel(),
  globalFilterFn: employeeSearch,
  onSortingChange: (updater) => valueUpdater(updater, sorting),
  onGlobalFilterChange: (updater) => valueUpdater(updater, globalFilter),
  getRowId: (row) => row.id,
  initialState: {
    pagination: { pageIndex: 0, pageSize: 10 },
    // Department is rendered under Role, so its own column stays hidden
    // while still being filterable from the toolbar.
    columnVisibility: { department: false },
  },
  state: {
    get sorting() {
      return sorting.value
    },
    get globalFilter() {
      return globalFilter.value
    },
  },
})

const summary = computed(() => {
  const { pageIndex, pageSize } = table.getState().pagination
  const filteredCount = table.getFilteredRowModel().rows.length
  const selectedCount = table.getFilteredSelectedRowModel().rows.length
  const from = filteredCount === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, filteredCount)
  return `${selectedCount > 0 ? `${selectedCount} selected · ` : ''}Showing ${from}–${to} of ${filteredCount} employees`
})

function ariaSort(sorted: false | 'asc' | 'desc') {
  return sorted === 'asc'
    ? 'ascending'
    : sorted === 'desc'
      ? 'descending'
      : undefined
}
</script>

<template>
  <div>
    <div class="mb-3 flex flex-wrap items-center gap-2">
      <Input
        v-model="globalFilter"
        type="search"
        placeholder="Search name, email, role, location..."
        aria-label="Search employees"
        class="w-full sm:w-72"
      />
      <ColumnMultiSelect
        :column="table.getColumn('department')"
        title="Department"
        :options="departments"
      />
      <ColumnMultiSelect
        :column="table.getColumn('status')"
        title="Status"
        :options="statuses"
      />
      <Button
        v-if="table.getState().columnFilters.length > 0"
        variant="ghost"
        size="sm"
        @click="table.resetColumnFilters()"
      >
        Reset
        <X class="h-4 w-4" />
      </Button>
      <Select v-model="density">
        <SelectTrigger class="w-40 sm:ml-auto" aria-label="Row density">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="compact">Compact</SelectItem>
            <SelectItem value="comfortable">Comfortable</SelectItem>
            <SelectItem value="spacious">Spacious</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>

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
              :class="densityHead[density]"
              :aria-sort="ariaSort(header.column.getIsSorted())"
            >
              <template v-if="!header.isPlaceholder">
                <button
                  v-if="header.column.getCanSort()"
                  type="button"
                  class="flex w-full cursor-pointer items-center gap-2 whitespace-nowrap select-none"
                  @click="header.column.getToggleSortingHandler()?.($event)"
                >
                  <FlexRender
                    :render="header.column.columnDef.header"
                    :props="header.getContext()"
                  />
                  <ArrowUp
                    v-if="header.column.getIsSorted() === 'asc'"
                    class="h-3 w-3 shrink-0"
                  />
                  <ArrowDown
                    v-else-if="header.column.getIsSorted() === 'desc'"
                    class="h-3 w-3 shrink-0"
                  />
                  <ArrowUpDown v-else class="h-3 w-3 shrink-0 opacity-50" />
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
            <TableRow
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              :data-state="row.getIsSelected() ? 'selected' : undefined"
            >
              <TableCell
                v-for="cell in row.getVisibleCells()"
                :key="cell.id"
                :class="densityCell[density]"
              >
                <FlexRender
                  :render="cell.column.columnDef.cell"
                  :props="cell.getContext()"
                />
              </TableCell>
            </TableRow>
          </template>
          <TableRow v-else>
            <TableCell
              :colspan="table.getVisibleLeafColumns().length"
              class="h-24 text-center"
            >
              No employees match your filters.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-2 py-3">
      <p class="text-sm text-muted-foreground" aria-live="polite">
        {{ summary }}
      </p>
      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="!table.getCanPreviousPage()"
          @click="table.previousPage()"
        >
          Previous
        </Button>
        <span class="text-sm tabular-nums text-muted-foreground">
          Page {{ table.getState().pagination.pageIndex + 1 }} of
          {{ Math.max(table.getPageCount(), 1) }}
        </span>
        <Button
          variant="outline"
          size="sm"
          :disabled="!table.getCanNextPage()"
          @click="table.nextPage()"
        >
          Next
        </Button>
      </div>
    </div>
  </div>
</template>
