'use client'

import { useMemo } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { X } from 'lucide-react'

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

interface DataTableProps<TData extends { role: string }, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  roleOptions: string[]
  search: string
  onSearchChange: (value: string) => void
  role: string
  onRoleChange: (value: string) => void
}

/**
 * Filter state (search/role) is fully controlled by the caller — this
 * component doesn't know or care whether it's backed by nuqs, native
 * URLSearchParams, plain useState, or anything else. See
 * `use-nuqs-filters.ts` and `use-native-filters.ts` for two drop-in ways
 * to supply that state.
 */
export function ParamsDataTable<TData extends { role: string }, TValue>({
  columns,
  data,
  roleOptions,
  search,
  onSearchChange,
  role,
  onRoleChange,
}: DataTableProps<TData, TValue>) {
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const matchesSearch = search
        ? Object.values(row as Record<string, unknown>).some((value) =>
            String(value).toLowerCase().includes(search.toLowerCase()),
          )
        : true
      const matchesRole = role ? row.role === role : true
      return matchesSearch && matchesRole
    })
  }, [data, search, role])

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const hasFilters = Boolean(search || role)

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <Input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full sm:w-64"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={role || 'all'}
            onValueChange={(value) => onRoleChange(value === 'all' ? '' : value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {roleOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasFilters ? (
            <Button
              variant="link"
              className="underline"
              onClick={() => {
                onSearchChange('')
                onRoleChange('')
              }}
            >
              Clear Filters <X className="h-3 w-3" />
            </Button>
          ) : null}
        </div>
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
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
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
