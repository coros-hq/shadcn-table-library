'use client'

import type { Row, Table } from '@tanstack/react-table'
import { Copy, CopyPlus, MoreHorizontal, Trash2 } from 'lucide-react'

import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'

export type RowAction = 'copy' | 'duplicate' | 'delete'

/** What the data table puts in `meta` so the menu can change rows */
export interface RowActionsMeta {
  duplicateRow?: (rowId: string) => void
  deleteRow?: (rowId: string) => void
}

// One menu per row. Duplicate and Delete change the table's rows through
// `table.options.meta`; swap them for your own API calls.
export function RowActions<TData>({
  row,
  table,
  actions,
}: {
  row: Row<TData>
  table: Table<TData>
  actions: RowAction[]
}) {
  const meta = (table.options.meta ?? {}) as RowActionsMeta

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 data-[state=open]:bg-muted"
          aria-label="Row actions"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {actions.includes('copy') ? (
          <DropdownMenuItem
            // The clipboard API is missing outside secure (https) pages
            onSelect={() => {
              if ('clipboard' in navigator) {
                void navigator.clipboard.writeText(row.id)
              }
            }}
          >
            <Copy />
            Copy ID
          </DropdownMenuItem>
        ) : null}
        {actions.includes('duplicate') ? (
          <DropdownMenuItem onSelect={() => meta.duplicateRow?.(row.id)}>
            <CopyPlus />
            Duplicate
          </DropdownMenuItem>
        ) : null}
        {actions.includes('delete') ? (
          <>
            {actions.length > 1 ? <DropdownMenuSeparator /> : null}
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => meta.deleteRow?.(row.id)}
            >
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
