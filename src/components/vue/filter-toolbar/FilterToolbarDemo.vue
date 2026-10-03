<script setup lang="ts">
import { format } from 'date-fns'
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import type { ColumnDef } from '@tanstack/vue-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import FilterToolbar from './FilterToolbar.vue'
import ActiveFilterChips from './ActiveFilterChips.vue'
import { conditionFilterFn } from './filter-fns'
import './types'

type Task = {
  id: string
  title: string
  category: string
  dueDate: Date
}

const data: Task[] = [
  { id: 'tsk-1', title: 'Redesign onboarding flow', category: 'Design', dueDate: new Date('2026-08-05') },
  { id: 'tsk-2', title: 'Fix pagination bug on export', category: 'Engineering', dueDate: new Date('2026-08-08') },
  { id: 'tsk-3', title: 'Write Q3 newsletter draft', category: 'Marketing', dueDate: new Date('2026-07-28') },
  { id: 'tsk-4', title: 'Audit component color tokens', category: 'Design', dueDate: new Date('2026-08-15') },
  { id: 'tsk-5', title: 'Migrate auth to new session store', category: 'Engineering', dueDate: new Date('2026-08-20') },
]

// Three variants, config-driven — no per-column filter wiring beyond `meta`.
// Every filterable column shares the same generic `conditionFilterFn`; the
// operator on the active condition (not the column) decides the comparison.
const columns: ColumnDef<Task>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    filterFn: conditionFilterFn,
    meta: {
      label: 'Title',
      filterVariant: 'text',
    },
  },
  {
    accessorKey: 'category',
    header: 'Category',
    filterFn: conditionFilterFn,
    meta: {
      label: 'Category',
      filterVariant: 'multiSelect',
      filterOptions: [
        { label: 'Design', value: 'Design' },
        { label: 'Engineering', value: 'Engineering' },
        { label: 'Marketing', value: 'Marketing' },
      ],
    },
  },
  {
    accessorKey: 'dueDate',
    header: 'Due date',
    filterFn: conditionFilterFn,
    cell: ({ getValue }) => format(getValue<Date>(), 'MMM d, yyyy'),
    meta: {
      label: 'Due date',
      filterVariant: 'dateRange',
    },
  },
]

const table = useVueTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
})
</script>

<template>
  <div>
    <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
      <FilterToolbar :table="table" />
    </div>

    <div class="mb-3">
      <ActiveFilterChips :table="table" />
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
