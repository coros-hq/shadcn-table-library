'use client'

import { useEffect, useRef, useState } from 'react'
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
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils.ts'
import { ArchiveButton, DeleteButton, SyncButton } from './action-buttons'
import { formatLastSynced } from './data'
import type { Source, SyncStatus } from './data'

const statusStyle: Record<SyncStatus, { dot: string; label: string }> = {
  synced: { dot: 'bg-emerald-500', label: 'Synced' },
  syncing: { dot: 'bg-sky-500 animate-pulse', label: 'Syncing…' },
  failed: { dot: 'bg-red-500', label: 'Failed' },
}

// How long the fake request, the exit fade, and the confirm/undo windows last
const REQUEST_MS = 1500
const EXIT_MS = 450
const CONFIRM_MS = 3000
const UNDO_MS = 6000

interface AsyncActionsTableProps {
  initialData: Source[]
}

export function AsyncActionsTable({ initialData }: AsyncActionsTableProps) {
  const [sources, setSources] = useState(initialData)
  // Latest rows for timer callbacks, which would otherwise see stale state
  const sourcesRef = useRef(sources)
  sourcesRef.current = sources
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [leaving, setLeaving] = useState<Set<string>>(new Set())
  const [archived, setArchived] = useState<{
    source: Source
    index: number
  } | null>(null)

  // Every pending timeout, so none fire after unmount or a reset
  const timers = useRef(new Set<number>())
  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.current.delete(id)
      fn()
    }, ms)
    timers.current.add(id)
    return id
  }
  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((id) => window.clearTimeout(id))
  }, [])
  const confirmTimer = useRef<number | undefined>(undefined)
  const undoTimer = useRef<number | undefined>(undefined)

  const update = (id: string, patch: Partial<Source>) =>
    setSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    )

  function sync(id: string) {
    update(id, { status: 'syncing' })
    later(() => {
      setSources((prev) =>
        prev.map((s) => {
          if (s.id !== id) return s
          return s.failsNext
            ? {
                ...s,
                status: 'failed',
                error: 'Connection timed out',
                failsNext: false,
              }
            : { ...s, status: 'synced', lastSyncedMin: 0, error: undefined }
        }),
      )
    }, REQUEST_MS)
  }

  // Fade the row out first so the icon's motion is visible, then remove it
  function removeAfterExit(
    id: string,
    onRemoved?: (source: Source, index: number) => void,
  ) {
    setLeaving((prev) => new Set(prev).add(id))
    later(() => {
      const index = sourcesRef.current.findIndex((s) => s.id === id)
      if (index !== -1) onRemoved?.(sourcesRef.current[index], index)
      setSources((prev) => prev.filter((s) => s.id !== id))
      setLeaving((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }, EXIT_MS)
  }

  function archive(id: string) {
    removeAfterExit(id, (source, index) => {
      setArchived({ source, index })
      window.clearTimeout(undoTimer.current)
      undoTimer.current = later(() => setArchived(null), UNDO_MS)
    })
  }

  function undoArchive() {
    if (!archived) return
    window.clearTimeout(undoTimer.current)
    setSources((prev) => {
      const next = [...prev]
      next.splice(Math.min(archived.index, next.length), 0, archived.source)
      return next
    })
    setArchived(null)
  }

  function requestDelete(id: string) {
    setConfirmingId(id)
    window.clearTimeout(confirmTimer.current)
    confirmTimer.current = later(() => setConfirmingId(null), CONFIRM_MS)
  }

  function confirmDelete(id: string) {
    window.clearTimeout(confirmTimer.current)
    setConfirmingId(null)
    removeAfterExit(id)
  }

  function reset() {
    timers.current.forEach((id) => window.clearTimeout(id))
    timers.current.clear()
    setSources(initialData)
    setConfirmingId(null)
    setLeaving(new Set())
    setArchived(null)
  }

  const columns: ColumnDef<Source>[] = [
    {
      accessorKey: 'name',
      header: 'Source',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.kind}</p>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const { status, error } = row.original
        return (
          <div className="flex items-center gap-2">
            <span
              className={cn('size-1.5 rounded-full', statusStyle[status].dot)}
            />
            <span>{statusStyle[status].label}</span>
            {status === 'failed' && error && (
              <span className="text-xs text-muted-foreground">· {error}</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'lastSyncedMin',
      header: 'Last synced',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatLastSynced(row.original.lastSyncedMin)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const source = row.original
        const busy = source.status === 'syncing' || leaving.has(source.id)
        return (
          <div className="flex items-center justify-end gap-1">
            <SyncButton status={source.status} onSync={() => sync(source.id)} />
            <ArchiveButton
              name={source.name}
              disabled={busy}
              concealed={confirmingId === source.id}
              onArchive={() => archive(source.id)}
            />
            <DeleteButton
              name={source.name}
              confirming={confirmingId === source.id}
              disabled={busy}
              onRequest={() => requestDelete(source.id)}
              onConfirm={() => confirmDelete(source.id)}
              onCancel={() => setConfirmingId(null)}
            />
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: sources,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Sync, archive, or delete a source. S3 fails its first sync on purpose.
        </p>
        <Button type="button" variant="ghost" size="sm" onClick={reset}>
          Reset demo
        </Button>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
                <TableRow
                  key={row.id}
                  className={cn(
                    'transition-opacity duration-300',
                    leaving.has(row.id) && 'opacity-0',
                  )}
                >
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
                  className="h-24 text-center text-muted-foreground"
                >
                  No sources left. Use Reset demo to bring them back.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div aria-live="polite" className="min-h-9">
        {archived && (
          <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-1.5 text-sm">
            <span>
              Archived{' '}
              <span className="font-medium">{archived.source.name}</span>
            </span>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto px-0"
              onClick={undoArchive}
            >
              Undo
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
