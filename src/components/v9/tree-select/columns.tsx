'use client'

import type { ColumnDef } from '@tanstack/react-table-v9'
import { ChevronRight } from 'lucide-react'

import { Checkbox } from '#/components/ui/checkbox.tsx'
import type { V9Features } from '#/lib/table-v9-features.ts'

export type OrgNode = {
  id: string
  name: string
  role: string
  status: string
  children?: OrgNode[]
}

export const columns: ColumnDef<V9Features, OrgNode>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllRowsSelected()
            ? true
            : table.getIsSomeRowsSelected()
              ? 'indeterminate'
              : false
        }
        onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
        aria-label="Select all rows"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={
          row.getIsSelected()
            ? true
            : row.getIsSomeSelected()
              ? 'indeterminate'
              : false
        }
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <div
        className="flex items-center gap-1.5"
        style={{ paddingLeft: `${row.depth * 1.25}rem` }}
      >
        {row.getCanExpand() ? (
          <button
            type="button"
            onClick={row.getToggleExpandedHandler()}
            className="flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground"
            aria-label={row.getIsExpanded() ? 'Collapse row' : 'Expand row'}
          >
            <ChevronRight
              className={`h-3.5 w-3.5 transition-transform ${
                row.getIsExpanded() ? 'rotate-90' : ''
              }`}
            />
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}
        {row.original.name}
      </div>
    ),
  },
  {
    accessorKey: 'role',
    header: 'Role',
    sortFn: 'alphanumeric',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    sortFn: 'basic',
  },
]
