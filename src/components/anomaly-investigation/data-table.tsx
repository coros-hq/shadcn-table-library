import { Fragment, useEffect, useRef, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ExpandedState, SortingState } from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { cn } from '#/lib/utils'
import { context, formatDay, formatValue, kindOf } from './anomalies'
import { columns } from './columns'
import type { AnomalyMeta } from './columns'
import type { Metric } from './data'
import { HistoryChart } from './history-chart'

// Secondary columns step aside on small screens
const responsive: Record<string, string> = {
  range: 'hidden md:table-cell',
  change: 'hidden sm:table-cell',
  kind: 'hidden sm:table-cell',
  // The two button columns give up their inner padding on phones
  expand: 'pr-0 sm:pr-2',
  review: 'pl-0 sm:pl-2',
}

export function AnomalyTable({
  metrics,
  meta,
}: {
  /** Already filtered by the demo */
  metrics: Metric[]
  meta: AnomalyMeta
}) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'change', desc: true },
  ])
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const frame = useRef<HTMLDivElement>(null)
  const focusNext = useRef<string | null>(null)

  const table = useReactTable({
    data: metrics,
    columns,
    getRowId: (m) => m.id,
    // Every metric has a history to show
    getRowCanExpand: () => true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    state: { sorting, expanded },
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    meta: {
      ...meta,
      // When reviewed rows are hidden, the row leaves under the pointer:
      // remember the next one so focus can move there instead of vanishing
      toggleReviewed: (id) => {
        const ids = table.getRowModel().rows.map((r) => r.original.id)
        const i = ids.indexOf(id)
        focusNext.current = ids.at(i + 1) ?? ids.at(i - 1) ?? null
        meta.toggleReviewed(id)
      },
    } satisfies AnomalyMeta,
  })

  useEffect(() => {
    const id = focusNext.current
    if (!id) return
    focusNext.current = null
    // Only when the button that had focus is gone; otherwise to the next
    // row's review button, or its expand button if it's in range
    if (frame.current?.contains(document.activeElement)) return
    const row = frame.current?.querySelector(`[data-metric="${id}"]`)
    ;(
      row?.querySelector<HTMLElement>('[aria-pressed]') ??
      row?.querySelector<HTMLElement>('button')
    )?.focus()
  })

  const rows = table.getRowModel().rows

  return (
    <div ref={frame} className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id} className="hover:bg-transparent">
              {group.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    responsive[header.column.id],
                    header.column.id === 'expand' && 'w-10',
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
          {rows.length ? (
            rows.map((row) => {
              const m = row.original
              const facts = context(m)
              return (
                <Fragment key={row.id}>
                  <TableRow
                    data-metric={m.id}
                    className={cn(
                      row.getIsExpanded() && 'border-b-0',
                      meta.reviewed.has(m.id) && 'text-muted-foreground',
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={responsive[cell.column.id]}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() ? (
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableCell />
                      <TableCell colSpan={columns.length - 1} className="py-4">
                        <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_14rem]">
                          <HistoryChart metric={m} />
                          <dl className="grid content-start gap-x-4 gap-y-2 text-sm">
                            <div>
                              <dt className="text-xs text-muted-foreground">
                                Expected today
                              </dt>
                              <dd className="tabular-nums">
                                {formatValue(m.today.low, m)}–
                                {formatValue(m.today.high, m)}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs text-muted-foreground">
                                7-day average
                              </dt>
                              <dd className="tabular-nums">
                                {formatValue(facts.average7, m)}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs text-muted-foreground">
                                Same day last week
                              </dt>
                              <dd className="tabular-nums">
                                {formatValue(facts.lastWeek.actual, m)}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs text-muted-foreground">
                                Earlier days outside the range
                              </dt>
                              <dd>
                                {facts.outside.length
                                  ? facts.outside
                                      .map(
                                        (p) =>
                                          `${formatDay(p.date)} (${kindOf(p)})`,
                                      )
                                      .join(', ')
                                  : 'None in the last 14 days'}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : null}
                </Fragment>
              )
            })
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columns.length}
                className="h-32 text-center text-muted-foreground"
              >
                Nothing to investigate here.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
