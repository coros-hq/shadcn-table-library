'use client'

import { useEffect, useRef } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

import { Button } from '#/components/ui/button'
import { Skeleton } from '#/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { columns } from './columns'
import { useInfiniteRows } from './use-infinite-rows'
import type { InfinitePage } from './use-infinite-rows'
import type { Transaction } from './data'

const SKELETON_ROWS = 4

interface InfiniteScrollTableProps {
  fetchPage: (cursor: number) => Promise<InfinitePage<Transaction>>
  total: number
}

export function InfiniteScrollTable({
  fetchPage,
  total,
}: InfiniteScrollTableProps) {
  const { rows, status, hasMore, loadMore } = useInfiniteRows(fetchPage)
  const scrollRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const canAutoLoad = hasMore && status === 'idle'

  // Depends on rows.length so a fresh observer is created after every page:
  // it reports the sentinel's current position straight away, which keeps
  // loading when a page was too short to push the sentinel out of view.
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!canAutoLoad || !sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void loadMore()
      },
      { root: scrollRef.current, rootMargin: '0px 0px 160px 0px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [canAutoLoad, loadMore, rows.length])

  return (
    <div>
      <div
        ref={scrollRef}
        className="max-h-96 overflow-auto rounded-md border [&_[data-slot=table-container]]:overflow-visible"
      >
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background shadow-[0_1px_0_var(--border)] [&_tr]:border-b-0">
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
            {status === 'loading' &&
              Array.from({ length: SKELETON_ROWS }, (_, i) => (
                <TableRow key={`skeleton-${i}`} aria-hidden>
                  {columns.map((_column, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full max-w-28" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <div ref={sentinelRef} className="h-px" aria-hidden />
        {status === 'error' && (
          <div
            role="alert"
            className="flex items-center justify-center gap-3 border-t p-3 text-sm"
          >
            <span className="text-muted-foreground">
              Couldn't load more transactions.
            </span>
            <Button size="sm" variant="outline" onClick={() => void loadMore()}>
              Retry
            </Button>
          </div>
        )}
      </div>
      <p
        className="mt-3 text-xs text-muted-foreground tabular-nums"
        aria-live="polite"
      >
        {hasMore
          ? `Showing ${rows.length} of ${total} — scroll for more`
          : `All ${total} transactions loaded`}
      </p>
    </div>
  )
}
