'use client'

import type { CSSProperties } from 'react'
import type { Column, Table } from '@tanstack/react-table'
import {
  ArrowLeftToLine,
  ArrowRightToLine,
  PinOff,
  Settings2,
} from 'lucide-react'

import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'

const headerText = <TData,>(column: Column<TData>) =>
  typeof column.columnDef.header === 'string'
    ? column.columnDef.header
    : column.id

/** A "Columns" menu that shows and hides columns */
export function ColumnsMenu<TData>({ table }: { table: Table<TData> }) {
  const columns = table.getAllLeafColumns().filter((c) => c.getCanHide())

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <Settings2 className="size-4" />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.getIsVisible()}
            // Keep the menu open so several columns can be toggled in a row
            onSelect={(e) => e.preventDefault()}
            onCheckedChange={(value) => column.toggleVisibility(value)}
          >
            {headerText(column)}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Pinning. A pinned column is `position: sticky`, offset by the widths of the
// pinned columns before it. Those widths come from TanStack's column sizes,
// so the table is laid out with `table-fixed` at `table.getTotalSize()`.

export function pinStyles<TData>(column: Column<TData>): CSSProperties {
  const pinned = column.getIsPinned()
  const size = column.getSize()
  return {
    width: size,
    minWidth: size,
    maxWidth: size,
    position: pinned ? 'sticky' : 'relative',
    left: pinned === 'left' ? column.getStart('left') : undefined,
    right: pinned === 'right' ? column.getAfter('right') : undefined,
    zIndex: pinned ? 1 : 0,
    // A soft edge where the pinned columns meet the ones scrolling under them
    boxShadow:
      pinned === 'left' && column.getIsLastColumn('left')
        ? '2px 0 4px -2px rgb(0 0 0 / 0.15)'
        : pinned === 'right' && column.getIsFirstColumn('right')
          ? '-2px 0 4px -2px rgb(0 0 0 / 0.15)'
          : undefined,
  }
}

/** Sticky cells need an opaque background so rows don't show through */
export const pinClass = <TData,>(column: Column<TData>) =>
  column.getIsPinned() ? 'bg-background' : ''

/** Pin and unpin buttons, shown when the header is hovered or focused */
export function PinControls<TData>({ column }: { column: Column<TData> }) {
  if (!column.getCanPin()) return null
  const name = headerText(column)

  if (column.getIsPinned()) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-6 shrink-0"
        aria-label={`Unpin ${name}`}
        onClick={() => column.pin(false)}
      >
        <PinOff className="size-3.5" />
      </Button>
    )
  }

  return (
    // Laid over the end of the header, so it takes no width from narrow columns
    <div className="absolute inset-y-0 right-1 my-auto flex h-6 items-center rounded-md bg-background opacity-0 group-hover/head:opacity-100 focus-within:opacity-100">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-6"
        aria-label={`Pin ${name} left`}
        onClick={() => column.pin('left')}
      >
        <ArrowLeftToLine className="size-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-6"
        aria-label={`Pin ${name} right`}
        onClick={() => column.pin('right')}
      >
        <ArrowRightToLine className="size-3.5" />
      </Button>
    </div>
  )
}
