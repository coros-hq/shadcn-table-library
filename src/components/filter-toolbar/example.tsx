'use client'

import { format } from 'date-fns'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'

import type { ColumnDef } from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { FilterToolbar } from './filter-toolbar'
import { ActiveFilterChips } from './active-filter-chips'
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

export function FilterToolbarDemo() {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <FilterToolbar table={table} />
      </div>

      <div className="mb-3">
        <ActiveFilterChips table={table} />
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
