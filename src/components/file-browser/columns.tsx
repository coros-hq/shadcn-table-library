import { ArrowDown, ArrowUp, ChevronRight } from 'lucide-react'
import type { Column, ColumnDef, Table } from '@tanstack/react-table'

import { Checkbox } from '#/components/ui/checkbox'
import { cn } from '#/lib/utils'
import type { Entry } from './data'
import { FileIcon } from './file-icon'
import { formatDate, formatSize, itemCount, kindLabel, sizeOf } from './files'

export interface BrowserMeta {
  open: (folderId: string) => void
}

const getMeta = (table: Table<Entry>) =>
  table.options.meta as unknown as BrowserMeta

function SortHeader({
  column,
  label,
  align = 'left',
}: {
  column: Column<Entry>
  label: string
  align?: 'left' | 'right'
}) {
  const sorted = column.getIsSorted()
  const Icon = sorted === 'desc' ? ArrowDown : ArrowUp
  return (
    <button
      type="button"
      onClick={column.getToggleSortingHandler()}
      className={cn(
        'group/sort inline-flex items-center gap-1 rounded-sm outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50',
        align === 'right' && 'ml-auto flex-row-reverse',
      )}
    >
      {label}
      <Icon
        aria-hidden
        className={cn(
          'size-3.5',
          !sorted && 'opacity-0 group-hover/sort:opacity-40',
        )}
      />
    </button>
  )
}

export const columns: ColumnDef<Entry>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        aria-label="Select everything in this folder"
        disabled={!table.getRowCount()}
        checked={
          table.getIsAllRowsSelected()
            ? true
            : table.getIsSomeRowsSelected()
              ? 'indeterminate'
              : false
        }
        onCheckedChange={(on) => table.toggleAllRowsSelected(!!on)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label={`Select ${row.original.name}`}
        checked={row.getIsSelected()}
        onCheckedChange={(on) => row.toggleSelected(!!on)}
      />
    ),
  },
  {
    id: 'name',
    accessorFn: (entry) => entry.name,
    header: ({ column }) => <SortHeader column={column} label="Name" />,
    cell: ({ row, table }) => {
      const entry = row.original
      const button =
        'flex min-w-0 items-center gap-2 rounded-sm text-left outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50'
      // A folder's name opens it; a file's name shows its details
      return entry.kind === 'folder' ? (
        <button
          type="button"
          data-entry={entry.id}
          onClick={() => getMeta(table).open(entry.id)}
          className={cn(button, 'font-medium')}
        >
          <FileIcon entry={entry} />
          <span className="truncate">{entry.name}</span>
        </button>
      ) : (
        <button
          type="button"
          data-entry={entry.id}
          aria-expanded={row.getIsExpanded()}
          onClick={row.getToggleExpandedHandler()}
          className={button}
        >
          <FileIcon entry={entry} />
          <span className="truncate">{entry.name}</span>
          <ChevronRight
            aria-hidden
            className={cn(
              'size-3.5 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none',
              row.getIsExpanded() && 'rotate-90',
            )}
          />
          <span className="sr-only">
            , {row.getIsExpanded() ? 'hide' : 'show'} details
          </span>
        </button>
      )
    },
  },
  {
    id: 'kind',
    header: 'Type',
    cell: ({ row }) => (
      <span className="text-muted-foreground">{kindLabel(row.original)}</span>
    ),
  },
  {
    id: 'size',
    accessorFn: (entry) => sizeOf(entry),
    header: ({ column }) => (
      <div className="flex">
        <SortHeader column={column} label="Size" align="right" />
      </div>
    ),
    cell: ({ row }) => (
      <span className="block text-right text-muted-foreground tabular-nums">
        {row.original.kind === 'folder'
          ? itemCount(row.original)
          : formatSize(row.original.size)}
      </span>
    ),
  },
  {
    id: 'modified',
    accessorFn: (entry) => entry.modified,
    header: ({ column }) => <SortHeader column={column} label="Modified" />,
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-muted-foreground tabular-nums">
        {formatDate(row.original.modified)}
      </span>
    ),
  },
  {
    id: 'owner',
    header: 'Owner',
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {row.original.owner}
      </span>
    ),
  },
]
