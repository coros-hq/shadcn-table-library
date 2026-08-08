'use client'

import { useMemo, useRef } from 'react'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '#/components/ui/table'
import { Button } from '#/components/ui/button'
import { ArchiveIcon } from '#/components/ui/icons/archive-icon.tsx'
import { ArrowsClockwiseIcon } from '#/components/ui/icons/arrows-clockwise-icon.tsx'
import { BellRingingIcon } from '#/components/ui/icons/bell-ringing-icon.tsx'
import { StarIcon } from '#/components/ui/icons/star-icon.tsx'
import { TrashIcon } from '#/components/ui/icons/trash-icon.tsx'
import type { IconHandle } from '#/lib/animated-icon.ts'
import { cn } from '#/lib/utils.ts'
import type { TeamMember } from './columns'

interface AnimatedIconsTableProps {
  data: TeamMember[]
  onDataChange: (updater: (prev: TeamMember[]) => TeamMember[]) => void
  onReset: () => void
}

export function AnimatedIconsTable({ data, onDataChange, onReset }: AnimatedIconsTableProps) {
  const refreshRef = useRef<IconHandle>(null)

  function toggle(id: string, key: 'favorite' | 'notify' | 'archived') {
    onDataChange((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: !row[key] } : row)))
  }

  function remove(id: string) {
    onDataChange((prev) => prev.filter((row) => row.id !== id))
  }

  function handleReset() {
    refreshRef.current?.startAnimation()
    onReset()
  }

  const columns = useMemo<ColumnDef<TeamMember>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <span className={cn(row.original.archived && 'text-muted-foreground line-through')}>
            {row.original.name}
          </span>
        ),
      },
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'role', header: 'Role' },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const member = row.original
          return (
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                aria-label={member.favorite ? 'Unfavorite' : 'Favorite'}
                aria-pressed={member.favorite}
                title={member.favorite ? 'Unfavorite' : 'Favorite'}
                onClick={() => toggle(member.id, 'favorite')}
                className={cn(
                  'rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground',
                  member.favorite && 'text-amber-500 hover:text-amber-500',
                )}
              >
                <StarIcon size={18} style={{ fill: member.favorite ? 'currentColor' : 'none' }} />
              </button>
              <button
                type="button"
                aria-label={member.notify ? 'Mute notifications' : 'Notify'}
                aria-pressed={member.notify}
                title={member.notify ? 'Mute notifications' : 'Notify'}
                onClick={() => toggle(member.id, 'notify')}
                className={cn(
                  'rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground',
                  member.notify && 'text-blue-500 hover:text-blue-500',
                )}
              >
                <BellRingingIcon size={18} />
              </button>
              <button
                type="button"
                aria-label={member.archived ? 'Unarchive' : 'Archive'}
                aria-pressed={member.archived}
                title={member.archived ? 'Unarchive' : 'Archive'}
                onClick={() => toggle(member.id, 'archived')}
                className={cn(
                  'rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground',
                  member.archived && 'text-foreground',
                )}
              >
                <ArchiveIcon size={18} />
              </button>
              <button
                type="button"
                aria-label="Delete"
                title="Delete"
                onClick={() => remove(member.id)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <TrashIcon size={18} />
              </button>
            </div>
          )
        },
      },
    ],
    [],
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Hover a row action to preview its motion; click to apply it.
        </p>
        <Button type="button" variant="outline" size="sm" onClick={handleReset}>
          <ArrowsClockwiseIcon ref={refreshRef} size={16} />
          Reset
        </Button>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className={header.id === 'actions' ? 'text-right' : undefined}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className={cn(row.original.archived && 'bg-muted/40')}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No team members. Click Reset to restore the demo data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
