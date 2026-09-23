'use client'

import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
} from '@tanstack/react-table'
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { cn } from '#/lib/utils.ts'
import { StatusIcon, hiddenColumns } from './columns'
import { environments, statuses } from './data'
import type { Deployment, DeploymentStatus } from './data'
import { FacetedFilter } from './faceted-filter'

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

interface DeploymentsTableProps {
  columns: ColumnDef<Deployment, any>[]
  data: Deployment[]
}

export function DeploymentsTable({ columns, data }: DeploymentsTableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    state: { columnFilters, globalFilter },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
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

  const envColumn = table.getColumn('environment')
  const dateColumn = table.getColumn('createdAt')
  const environment =
    (envColumn?.getFilterValue() as string[] | undefined)?.[0] ?? 'all'
  const days = dateColumn?.getFilterValue() as number | undefined
  const isFiltered = columnFilters.length > 0 || globalFilter !== ''

  function clearAll() {
    setColumnFilters([])
    setGlobalFilter('')
  }

  const filteredCount = table.getFilteredRowModel().rows.length
  const { pageIndex, pageSize } = table.getState().pagination

  return (
    <div className="space-y-3">
      {/* Row 1: search + result count. Row 2: filters. */}
      <div className="flex items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Branch, commit, author…"
            aria-label="Search deployments"
            className="h-8 pl-8"
          />
        </div>
        <p
          className="ml-auto shrink-0 text-sm text-muted-foreground tabular-nums"
          aria-live="polite"
        >
          {filteredCount === data.length
            ? `${data.length} deployments`
            : `${filteredCount} of ${data.length}`}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={environment}
          onValueChange={(value) =>
            envColumn?.setFilterValue(value === 'all' ? undefined : [value])
          }
        >
          <SelectTrigger
            size="sm"
            className="h-8 w-40"
            aria-label="Environment"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All environments</SelectItem>
            {environments.map((env) => (
              <SelectItem key={env} value={env}>
                {env}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <FacetedFilter
          column={table.getColumn('status')}
          title="Status"
          options={statuses}
          renderIcon={(status) => (
            <StatusIcon status={status as DeploymentStatus} />
          )}
        />
        <FacetedFilter
          column={table.getColumn('branch')}
          title="Branch"
          options={[...new Set(data.map((d) => d.branch))].sort()}
        />

        <Select
          value={days === undefined ? 'all' : String(days)}
          onValueChange={(value) =>
            dateColumn?.setFilterValue(
              value === 'all' ? undefined : Number(value),
            )
          }
        >
          <SelectTrigger size="sm" className="h-8 w-36" aria-label="Date range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {datePresets.map((preset) => (
              <SelectItem key={preset.value} value={preset.value}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isFiltered && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={clearAll}
          >
            Reset
            <X className="size-3.5" />
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      header.column.id === 'createdAt' && 'text-right',
                    )}
                  >
                    {flexRender(
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
                    <TableCell key={cell.id} className="py-3">
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
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className="h-32 text-center"
                >
                  <p className="text-muted-foreground">
                    No deployments match these filters.
                  </p>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={clearAll}
                  >
                    Reset filters
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {filteredCount > pageSize && (
        <div className="flex items-center justify-end gap-2">
          <p className="mr-auto text-sm text-muted-foreground tabular-nums">
            {pageIndex * pageSize + 1}–
            {Math.min((pageIndex + 1) * pageSize, filteredCount)} of{' '}
            {filteredCount}
          </p>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            aria-label="Previous page"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            aria-label="Next page"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
