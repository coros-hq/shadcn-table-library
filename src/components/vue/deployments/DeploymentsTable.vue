<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  FlexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import type {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
} from '@tanstack/vue-table'
import { ChevronLeft, ChevronRight, Search, X } from '@lucide/vue'

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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn, valueUpdater } from '@/lib/utils'
import { hiddenColumns } from './columns'
import { environments, statuses } from './data'
import type { Deployment, DeploymentStatus } from './data'
import FacetedFilter from './FacetedFilter.vue'
import StatusIcon from './StatusIcon.vue'

const datePresets = [
  { value: 'all', label: 'All time', days: undefined },
  { value: '1', label: 'Last 24 hours', days: 1 },
  { value: '7', label: 'Last 7 days', days: 7 },
  { value: '30', label: 'Last 30 days', days: 30 },
] as const

// Search matches the fields people actually paste: id, branch, sha, message, author
const searchDeployments: FilterFn<Deployment> = (row, _id, query: string) => {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const d = row.original
  return [d.id, d.branch, d.sha, d.message, d.author].some((field) =>
    field.toLowerCase().includes(q),
  )
}

const props = defineProps<{
  columns: ColumnDef<Deployment, any>[]
  data: Deployment[]
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
  getRowId: (row) => row.id,
  state: {
    get columnFilters() {
      return columnFilters.value
    },
    get globalFilter() {
      return globalFilter.value
    },
  },
  onColumnFiltersChange: (updater) => valueUpdater(updater, columnFilters),
  onGlobalFilterChange: (updater) => valueUpdater(updater, globalFilter),
  globalFilterFn: searchDeployments,
  // Filters should send the user back to page 1, not leave them on an empty page 4
  autoResetPageIndex: true,
  initialState: {
    columnVisibility: hiddenColumns,
    pagination: { pageSize: 10 },
  },
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getFacetedRowModel: getFacetedRowModel(),
  getFacetedUniqueValues: getFacetedUniqueValues(),
  getPaginationRowModel: getPaginationRowModel(),
})

const envColumn = computed(() => table.getColumn('environment'))
const dateColumn = computed(() => table.getColumn('createdAt'))
const environment = computed(
  () => (envColumn.value?.getFilterValue() as string[] | undefined)?.[0] ?? 'all',
)
const days = computed(
  () => dateColumn.value?.getFilterValue() as number | undefined,
)
const isFiltered = computed(
  () => columnFilters.value.length > 0 || globalFilter.value !== '',
)
const branches = computed(() => [...new Set(props.data.map((d) => d.branch))].sort())

function clearAll() {
  columnFilters.value = []
  globalFilter.value = ''
}

const filteredCount = computed(() => table.getFilteredRowModel().rows.length)
const pagination = computed(() => table.getState().pagination)
</script>

<template>
  <div class="space-y-3">
    <!-- Row 1: search + result count. Row 2: filters. -->
    <div class="flex items-center gap-3">
      <div class="relative w-full sm:w-72">
        <Search
          class="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          v-model="globalFilter"
          placeholder="Branch, commit, author…"
          aria-label="Search deployments"
          class="h-8 pl-8"
        />
      </div>
      <p
        class="ml-auto shrink-0 text-sm text-muted-foreground tabular-nums"
        aria-live="polite"
      >
        {{
          filteredCount === data.length
            ? `${data.length} deployments`
            : `${filteredCount} of ${data.length}`
        }}
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <Select
        :model-value="environment"
        @update:model-value="
          (value) =>
            envColumn?.setFilterValue(value === 'all' ? undefined : [value])
        "
      >
        <SelectTrigger size="sm" class="h-8 w-40" aria-label="Environment">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All environments</SelectItem>
          <SelectItem v-for="env in environments" :key="env" :value="env">
            {{ env }}
          </SelectItem>
        </SelectContent>
      </Select>

      <FacetedFilter
        :column="table.getColumn('status')"
        title="Status"
        :options="statuses"
      >
        <template #icon="{ value }">
          <StatusIcon :status="value as DeploymentStatus" />
        </template>
      </FacetedFilter>
      <FacetedFilter
        :column="table.getColumn('branch')"
        title="Branch"
        :options="branches"
      />

      <Select
        :model-value="days === undefined ? 'all' : String(days)"
        @update:model-value="
          (value) =>
            dateColumn?.setFilterValue(value === 'all' ? undefined : Number(value))
        "
      >
        <SelectTrigger size="sm" class="h-8 w-36" aria-label="Date range">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="preset in datePresets"
            :key="preset.value"
            :value="preset.value"
          >
            {{ preset.label }}
          </SelectItem>
        </SelectContent>
      </Select>

      <Button
        v-if="isFiltered"
        type="button"
        variant="ghost"
        size="sm"
        class="h-8 px-2"
        @click="clearAll"
      >
        Reset
        <X class="size-3.5" />
      </Button>
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
              :class="cn(header.column.id === 'createdAt' && 'text-right')"
            >
              <FlexRender
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="table.getRowModel().rows.length">
            <TableRow v-for="row in table.getRowModel().rows" :key="row.id">
              <TableCell
                v-for="cell in row.getVisibleCells()"
                :key="cell.id"
                class="py-3"
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
              class="h-32 text-center"
            >
              <p class="text-muted-foreground">
                No deployments match these filters.
              </p>
              <Button type="button" variant="link" size="sm" @click="clearAll">
                Reset filters
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <div
      v-if="filteredCount > pagination.pageSize"
      class="flex items-center justify-end gap-2"
    >
      <p class="mr-auto text-sm text-muted-foreground tabular-nums">
        {{ pagination.pageIndex * pagination.pageSize + 1 }}–{{
          Math.min((pagination.pageIndex + 1) * pagination.pageSize, filteredCount)
        }}
        of {{ filteredCount }}
      </p>
      <Button
        type="button"
        variant="outline"
        size="icon"
        class="size-8"
        aria-label="Previous page"
        :disabled="!table.getCanPreviousPage()"
        @click="table.previousPage()"
      >
        <ChevronLeft class="size-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        class="size-8"
        aria-label="Next page"
        :disabled="!table.getCanNextPage()"
        @click="table.nextPage()"
      >
        <ChevronRight class="size-4" />
      </Button>
    </div>
  </div>
</template>
