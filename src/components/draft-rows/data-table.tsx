import type { ReactNode } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { cn } from '#/lib/utils'
import { columns } from './columns'
import type { DraftMeta, Row } from './columns'

export function DraftRowsTable({
  rows,
  meta,
  fresh,
  footer,
}: {
  rows: Row[]
  meta: DraftMeta
  /** Ids of rows that were just saved, highlighted for a moment */
  fresh: Set<string>
  /** The "Add row" line under the last row */
  footer: ReactNode
}) {
  const table = useReactTable({
    data: rows,
    columns,
    // Stable ids keep each input, and the focus in it, across keystrokes
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    meta,
  })

  return (
    <div className="overflow-hidden rounded-md border">
      <Table className="min-w-[640px]">
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id} className="hover:bg-transparent">
              {group.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    header.column.id === 'amount' && 'w-32',
                    header.column.id === 'actions' && 'w-32',
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
            const draft = row.original.kind === 'draft'
            return (
              <TableRow
                key={row.id}
                data-kind={row.original.kind}
                className={cn(
                  'transition-colors duration-1000',
                  draft &&
                    'bg-blue-50/60 hover:bg-blue-50/60 dark:bg-blue-500/5 dark:hover:bg-blue-500/5',
                  fresh.has(row.id) && 'bg-emerald-50 dark:bg-emerald-500/10',
                )}
              >
                {row.getVisibleCells().map((cell, i) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      draft ? 'py-1.5 align-top' : 'h-11',
                      // A blue edge marks the rows that aren't saved yet
                      draft &&
                        i === 0 &&
                        'shadow-[inset_3px_0_0_var(--color-blue-500)]',
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            )
          })}
        </TableBody>
        <TableFooter className="bg-transparent">
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={columns.length} className="p-1.5">
              {footer}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
