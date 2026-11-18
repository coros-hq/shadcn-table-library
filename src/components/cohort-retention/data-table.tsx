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
import type { CohortMeta } from './columns'
import { cohorts } from './data'

const isMonth = (id: string) => /^m\d+$/.test(id)

export function CohortTable(meta: CohortMeta) {
  const table = useReactTable({
    data: cohorts,
    columns,
    getRowId: (cohort) => cohort.id,
    getCoreRowModel: getCoreRowModel(),
    meta,
  })

  // The cohort column stays put while the months scroll on small screens
  const sticky = 'sticky left-0 z-10 bg-background'

  return (
    <div
      // The one hue every retention cell is a shade of
      className="overflow-hidden rounded-md border [--cohort:var(--color-blue-600)] dark:[--cohort:var(--color-blue-500)]"
    >
      <Table className="min-w-[860px]">
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id} className="hover:bg-transparent">
              {group.headers.map((header) => (
                <TableHead
                  key={header.id}
                  colSpan={header.colSpan}
                  className={cn(
                    'h-8',
                    header.column.id === 'cohort' && sticky,
                    isMonth(header.column.id) && 'w-14 px-0.5',
                    header.column.id === 'months' && 'border-b',
                  )}
                >
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
          {table.getRowModel().rows.map((row) => {
            const dimmed =
              meta.highlighted !== null && meta.highlighted !== row.id
            return (
              <TableRow
                key={row.id}
                aria-current={meta.highlighted === row.id ? 'true' : undefined}
                className={cn(
                  'border-0 transition-opacity hover:bg-transparent motion-reduce:transition-none',
                  dimmed && 'opacity-35',
                  meta.highlighted === row.id &&
                    'shadow-[inset_3px_0_0_var(--color-primary)]',
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      'py-0.5',
                      cell.column.id === 'cohort' && sticky,
                      isMonth(cell.column.id) && 'px-0.5',
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
          {table
            .getFooterGroups()
            .slice(0, 1)
            .map((group) => (
              <TableRow key={group.id} className="hover:bg-transparent">
                {group.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    className={cn(
                      'py-1.5',
                      header.column.id === 'cohort' && sticky,
                      isMonth(header.column.id) && 'px-0.5',
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.footer,
                          header.getContext(),
                        )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
        </TableFooter>
      </Table>
    </div>
  )
}
