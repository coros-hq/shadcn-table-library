<script setup lang="ts" generic="TData, TValue">
import { computed, ref } from 'vue'
import { format } from 'date-fns'
import { CalendarDate, getLocalTimeZone } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
import { CalendarIcon } from '@lucide/vue'
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
import { Button } from '@/components/ui/button'
import { RangeCalendar } from '@/components/ui/range-calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import MultiSelectFilter from '@/components/ui/multi-select-filter/MultiSelectFilter.vue'
import ActiveFilterChips from './ActiveFilterChips.vue'
import type { ActiveFilter } from './type'

interface FilterOption {
  value: string
  label: string
}

const props = defineProps<{
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  categoryOptions: FilterOption[]
}>()

const globalFilter = ref('')
const filters = ref<ActiveFilter[]>([])

const categoryFilter = computed(() =>
  filters.value.find(
    (f): f is Extract<ActiveFilter, { type: 'multiSelect' }> =>
      f.type === 'multiSelect' && f.columnId === 'category',
  ),
)
const dueDateFilter = computed(() =>
  filters.value.find(
    (f): f is Extract<ActiveFilter, { type: 'dateRange' }> =>
      f.type === 'dateRange' && f.columnId === 'dueDate',
  ),
)

function setCategoryValues(values: string[]) {
  const rest = filters.value.filter((f) => f.columnId !== 'category')
  filters.value =
    values.length === 0
      ? rest
      : [...rest, { type: 'multiSelect', columnId: 'category', values }]
}

// The calendar speaks @internationalized/date; the filter state stores plain Dates
const toCalendarDate = (date?: Date) =>
  date
    ? new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
    : undefined
const toDate = (value?: DateValue) => value?.toDate(getLocalTimeZone())

function setDueDateRange(range: { start?: DateValue; end?: DateValue }) {
  const from = toDate(range.start)
  const to = toDate(range.end)
  const rest = filters.value.filter((f) => f.columnId !== 'dueDate')
  filters.value =
    !from && !to
      ? rest
      : [...rest, { type: 'dateRange', columnId: 'dueDate', from, to }]
}

function removeFilter(columnId: string) {
  filters.value = filters.value.filter((f) => f.columnId !== columnId)
}

function clearAll() {
  filters.value = []
}

// `filters` is the single source of truth for structured filters — it
// drives both the toolbar controls and the chips row. columnFilters is
// derived from it rather than owned by the table.
const columnFilters = computed<ColumnFiltersState>(() =>
  filters.value.map((f) =>
    f.type === 'multiSelect'
      ? { id: f.columnId, value: f.values }
      : { id: f.columnId, value: { from: f.from, to: f.to } },
  ),
)

const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
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
      <MultiSelectFilter
        title="Category"
        :options="categoryOptions"
        :selected="categoryFilter?.values ?? []"
        @update:selected="setCategoryValues"
      />
      <Popover>
        <PopoverTrigger as-child>
          <Button variant="outline" size="sm">
            <CalendarIcon class="mr-2 h-4 w-4" />
            <template v-if="dueDateFilter?.from">
              {{ format(dueDateFilter.from, 'MMM d') }}
              <template v-if="dueDateFilter.to">
                – {{ format(dueDateFilter.to, 'MMM d') }}
              </template>
            </template>
            <template v-else>Due date</template>
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-auto p-0" align="start">
          <RangeCalendar
            :number-of-months="2"
            :default-placeholder="toCalendarDate(dueDateFilter?.from)"
            :model-value="{
              start: toCalendarDate(dueDateFilter?.from),
              end: toCalendarDate(dueDateFilter?.to),
            }"
            @update:model-value="setDueDateRange"
          />
        </PopoverContent>
      </Popover>
    </div>

    <div class="mb-3">
      <ActiveFilterChips
        :filters="filters"
        @remove="removeFilter"
        @clear-all="clearAll"
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
