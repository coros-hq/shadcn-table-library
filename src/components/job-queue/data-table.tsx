import { Fragment, useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
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
import { cn } from '#/lib/utils'
import { columns } from './columns'
import type { QueueMeta } from './columns'
import type { Job } from './data'
import { JobErrors } from './job-errors'
import { hasErrors } from './queue'
import type { View } from './queue'

export function JobQueueTable({
  jobs,
  view,
  meta,
}: {
  jobs: Job[]
  view: View
  meta: QueueMeta
}) {
  const [expanded, setExpanded] = useState<ExpandedState>({})
  // Memoized: a new filter array on every tick would refilter for nothing
  const columnFilters = useMemo(
    () => (view === 'all' ? [] : [{ id: 'status', value: view }]),
    [view],
  )

  const table = useReactTable({
    data: jobs,
    columns,
    // Ids keep a row (and whether it's expanded) stable while jobs update
    getRowId: (job) => job.id,
    getRowCanExpand: (row) => hasErrors(row.original),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    state: { expanded, columnFilters },
    onExpandedChange: setExpanded,
    // The data changes several times a second; nothing should reset with it
    autoResetExpanded: false,
    autoResetPageIndex: false,
    meta,
  })

  const rows = table.getRowModel().rows

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(header.column.id === 'expand' && 'w-10')}
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
          {rows.length ? (
            rows.map((row) => (
              <Fragment key={row.id}>
                <TableRow
                  className={cn(
                    row.original.status === 'failed' &&
                      'bg-destructive/[0.03] hover:bg-destructive/[0.06]',
                    row.getIsExpanded() && 'border-b-0',
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2.5">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                {row.getIsExpanded() ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={columns.length}
                      className="bg-muted/30 py-4 pr-4 pl-12 whitespace-normal"
                    >
                      <JobErrors job={row.original} />
                    </TableCell>
                  </TableRow>
                ) : null}
              </Fragment>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                {view === 'failed' ? 'No failed jobs.' : `No ${view} jobs.`}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
