'use client'

import { useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import type { AggregationType, PivotRow, SalesRecord } from './pivot'
import { pivotData } from './pivot'

const DIMENSIONS: { value: keyof SalesRecord; label: string }[] = [
  { value: 'region', label: 'Region' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'channel', label: 'Channel' },
]

const AGGREGATIONS: { value: AggregationType; label: string }[] = [
  { value: 'sum', label: 'Sum' },
  { value: 'avg', label: 'Average' },
  { value: 'count', label: 'Count' },
]

function formatValue(value: number, aggFn: AggregationType) {
  if (aggFn === 'count') return value.toLocaleString('en-US')
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
}

interface PivotTableProps {
  data: SalesRecord[]
}

export function PivotTable({ data }: PivotTableProps) {
  const [rowDim, setRowDim] = useState<keyof SalesRecord>('region')
  const [colDim, setColDim] = useState<keyof SalesRecord>('quarter')
  const [aggFn, setAggFn] = useState<AggregationType>('sum')

  const { colValues, rows, columnTotals, grandTotal } = useMemo(
    () => pivotData(data, rowDim, colDim, aggFn),
    [data, rowDim, colDim, aggFn],
  )

  const rowLabel = DIMENSIONS.find((d) => d.value === rowDim)!.label

  const columns = useMemo<ColumnDef<PivotRow>[]>(
    () => [
      {
        id: 'rowValue',
        header: rowLabel,
        accessorKey: 'rowValue',
        cell: ({ getValue }) => (
          <span className="font-medium">{getValue() as string}</span>
        ),
      },
      ...colValues.map(
        (colValue): ColumnDef<PivotRow> => ({
          id: colValue,
          header: colValue,
          accessorFn: (row) => row.cells[colValue],
          cell: ({ getValue }) => formatValue(getValue() as number, aggFn),
        }),
      ),
      {
        id: 'total',
        header: 'Total',
        accessorKey: 'total',
        cell: ({ getValue }) => (
          <span className="font-medium">
            {formatValue(getValue() as number, aggFn)}
          </span>
        ),
      },
    ],
    [colValues, rowLabel, aggFn],
  )

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows</span>
          <Select
            value={rowDim}
            onValueChange={(v) => setRowDim(v as keyof SalesRecord)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIMENSIONS.filter((d) => d.value !== colDim).map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Columns</span>
          <Select
            value={colDim}
            onValueChange={(v) => setColDim(v as keyof SalesRecord)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIMENSIONS.filter((d) => d.value !== rowDim).map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Aggregate</span>
          <Select
            value={aggFn}
            onValueChange={(v) => setAggFn(v as AggregationType)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AGGREGATIONS.map((a) => (
                <SelectItem key={a.value} value={a.value}>
                  {a.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Total</TableCell>
              {colValues.map((colValue) => (
                <TableCell key={colValue}>
                  {formatValue(columnTotals[colValue], aggFn)}
                </TableCell>
              ))}
              <TableCell>{formatValue(grandTotal, aggFn)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  )
}
