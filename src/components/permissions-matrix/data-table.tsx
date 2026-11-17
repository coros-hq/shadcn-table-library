import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ExpandedState } from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { TooltipProvider } from '#/components/ui/tooltip'
import { cn } from '#/lib/utils'
import { columns, rows } from './columns'
import type { MatrixMeta } from './columns'

export function PermissionsTable(meta: MatrixMeta) {
  const [expanded, setExpanded] = useState<ExpandedState>(true)

  const table = useReactTable({
    data: rows,
    columns,
    getRowId: (row) => row.id,
    getSubRows: (row) => row.subRows,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    state: { expanded },
    onExpandedChange: setExpanded,
    meta,
  })

  return (
    <TooltipProvider delayDuration={200}>
      <div className="overflow-x-auto rounded-md border">
        <Table className="min-w-[600px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      'h-auto py-2.5',
                      header.column.id === 'resource'
                        ? 'sticky left-0 z-10 bg-background'
                        : 'w-20 text-center',
                      header.column.id === 'all' && 'border-l',
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
            {table.getRowModel().rows.map((row) => {
              const isGroup = row.getCanExpand()
              return (
                <TableRow
                  key={row.id}
                  // Cells paint the row color themselves: the pinned name column
                  // must be opaque, and this keeps it matching the cells beside it
                  className="group/row hover:bg-transparent has-aria-expanded:bg-transparent"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        isGroup
                          ? 'bg-muted'
                          : 'bg-background group-hover/row:bg-[color-mix(in_oklab,var(--muted)_50%,var(--background))]',
                        cell.column.id === 'resource'
                          ? 'sticky left-0 z-10 max-w-40 sm:max-w-64'
                          : 'text-center [&>*]:align-middle',
                        cell.column.id === 'all' && 'border-l',
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  )
}
