<script setup lang="ts">
import { computed } from 'vue'
import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import type { ColumnDef, SortingState } from '@tanstack/vue-table'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from '@lucide/vue'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getUsersPageCombined } from '../data'
import { useServerQuery } from '../useServerQuery'
import { useUrlSearch } from '../useUrlSearch'
import type { User } from './columns'

const props = defineProps<{ columns: ColumnDef<User>[] }>()

const PAGES_SIZE = ['10', '20', '30', '40', '50']

const { search, navigate } = useUrlSearch({
  page: 0,
  pageSize: 10,
  role: '',
  status: '',
  sortBy: '',
  sortDir: 'asc' as 'asc' | 'desc',
})

const { result, isPending } = useServerQuery(
  () => ({ ...search }),
  getUsersPageCombined,
  { rows: [], pageCount: 0 },
)

// Sort state is derived from the URL, not local state — the URL stays the
// single source of truth, matching filtering and pagination.
const sorting = computed<SortingState>(() =>
  search.sortBy ? [{ id: search.sortBy, desc: search.sortDir === 'desc' }] : [],
)

const table = useVueTable({
  get data() {
    return result.value.rows
  },
  get columns() {
    return props.columns
  },
  get pageCount() {
    return result.value.pageCount
  },
  manualPagination: true,
  manualSorting: true,
  manualFiltering: true,
  getCoreRowModel: getCoreRowModel(),
  state: {
    get sorting() {
      return sorting.value
    },
    get pagination() {
      return { pageIndex: search.page, pageSize: search.pageSize }
    },
  },
  onSortingChange: (updater) => {
    const next = typeof updater === 'function' ? updater(sorting.value) : updater
    const nextSort = next[0]
    navigate({
      sortBy: nextSort?.id ?? '',
      sortDir: nextSort?.desc ? 'desc' : 'asc',
      page: 0, // reset to page 0 — the result order changed
    })
  },
  onPaginationChange: (updater) => {
    const next =
      typeof updater === 'function'
        ? updater({ pageIndex: search.page, pageSize: search.pageSize })
        : updater
    navigate({ page: next.pageIndex, pageSize: next.pageSize })
  },
})
</script>

<template>
  <div>
    <div class="mb-4 flex flex-wrap gap-2">
      <Select
        :model-value="search.role || 'all'"
        @update:model-value="
          (val) => navigate({ role: val === 'all' ? '' : String(val), page: 0 }) // reset to page 0 — the result set size changed
        "
      >
        <SelectTrigger class="w-32">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All roles</SelectItem>
          <SelectItem value="Admin">Admin</SelectItem>
          <SelectItem value="Editor">Editor</SelectItem>
          <SelectItem value="Viewer">Viewer</SelectItem>
        </SelectContent>
      </Select>
      <Select
        :model-value="search.status || 'all'"
        @update:model-value="
          (val) => navigate({ status: val === 'all' ? '' : String(val), page: 0 })
        "
      >
        <SelectTrigger class="w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="Active">Active</SelectItem>
          <SelectItem value="Inactive">Inactive</SelectItem>
          <SelectItem value="Pending">Pending</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div
      :class="cn('overflow-hidden rounded-md border transition-opacity', isPending && 'opacity-50')"
    >
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
                <ArrowUp v-if="header.column.getIsSorted() === 'asc'" class="h-3 w-3" />
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

    <div class="mt-5 flex justify-end gap-1">
      <Button variant="outline" :disabled="!table.getCanPreviousPage()" @click="table.firstPage()">
        <ChevronsLeft class="h-3 w-3" />
      </Button>
      <Button variant="outline" :disabled="!table.getCanPreviousPage()" @click="table.previousPage()">
        <ChevronLeft class="h-3 w-3" />
      </Button>
      <Button variant="outline" :disabled="!table.getCanNextPage()" @click="table.nextPage()">
        <ChevronRight class="h-3 w-3" />
      </Button>
      <Button variant="outline" :disabled="!table.getCanNextPage()" @click="table.lastPage()">
        <ChevronsRight class="h-3 w-3" />
      </Button>
      <Select
        :model-value="search.pageSize.toString()"
        @update:model-value="(val) => table.setPageSize(Number(val))"
      >
        <SelectTrigger class="h-1/3">
          <SelectValue :placeholder="PAGES_SIZE[0]" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem v-for="size in PAGES_SIZE" :key="size" :value="size">
              {{ size }}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  </div>
</template>
