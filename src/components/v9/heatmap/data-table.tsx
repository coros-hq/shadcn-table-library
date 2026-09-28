'use client'

import { useMemo } from 'react'
import {
  flexRender,
  useTable,
} from '@tanstack/react-table-v9'
import type { ColumnDef } from '@tanstack/react-table-v9'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { cn } from '#/lib/utils.ts'
import type { HeatmapRow } from './heatmap'
import { getHeatColor, getHeatmapRange } from './heatmap'
import { v9Features, type V9Features } from '#/lib/table-v9-features.ts'

interface HeatmapTableProps {
  columns: string[]
  data: HeatmapRow[]
  formatValue?: (value: number) => string
}

export function HeatmapTable({
  columns,
  data,
  formatValue = (value) => String(value),
}: HeatmapTableProps) {
  const { min, max } = useMemo(
    () => getHeatmapRange(data, columns),
    [data, columns],
  )

  const tableColumns = useMemo<ColumnDef<V9Features, HeatmapRow>[]>(
    () => [
      {
        id: 'label',
        header: '',
        accessorKey: 'label',
        cell: ({ getValue }) => (
          <span className="font-medium">{getValue() as string}</span>
        ),
      },
      ...columns.map(
        (col): ColumnDef<V9Features, HeatmapRow> => ({
          id: col,
          header: col,
          accessorFn: (row) => row.values[col],
          cell: ({ getValue }) => {
            const value = getValue() as number
            const { backgroundColor, isDark } = getHeatColor(value, min, max)
            return (
              <div
                style={{ backgroundColor }}
                className={cn(
                  'flex h-full w-full items-center justify-center px-3 py-2.5 text-sm tabular-nums',
                  isDark ? 'text-white' : 'text-foreground',
                )}
              >
                {formatValue(value)}
              </div>
            )
          },
        }),
      ),
    ],
    [columns, min, max, formatValue],
  )

  const table = useTable({
    features: v9Features,
    data,
    columns: tableColumns,
  })

  const legendLow = getHeatColor(min, min, max).backgroundColor
  const legendHigh = getHeatColor(max, min, max).backgroundColor

  return (
    <div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-center">
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
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      cell.column.id === 'label' ? undefined : 'p-0 text-center',
                    )}
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext(),
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <span>{formatValue(min)}</span>
        <div
          className="h-2 flex-1 rounded-full"
          style={{
            background: `linear-gradient(to right, ${legendLow}, ${legendHigh})`,
          }}
        />
        <span>{formatValue(max)}</span>
      </div>
    </div>
  )
}
