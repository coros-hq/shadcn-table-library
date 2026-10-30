import type { ColumnDef, FilterFn } from '@tanstack/table-core'
import { renderComponent } from '$lib/components/ui/data-table/index.js'
import { NOW } from './data'
import type { Deployment } from './data'
import CreatedCell from './CreatedCell.svelte'
import DeploymentCell from './DeploymentCell.svelte'
import SourceCell from './SourceCell.svelte'
import StatusCell from './StatusCell.svelte'

// Multi-select filters store string[]; an empty/undefined value means "all"
const inList: FilterFn<Deployment> = (row, id, value: string[] | undefined) =>
  !value?.length || value.includes(row.getValue<string>(id))

// The date filter stores a number of days back from NOW
const withinDays: FilterFn<Deployment> = (row, id, days: number | undefined) =>
  days === undefined || row.getValue<number>(id) >= NOW - days * 86_400_000

export const columns: ColumnDef<Deployment>[] = [
  {
    accessorKey: 'id',
    header: 'Deployment',
    cell: ({ row }) =>
      renderComponent(DeploymentCell, { deployment: row.original }),
  },
  {
    accessorKey: 'environment',
    filterFn: inList,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    filterFn: inList,
    cell: ({ row }) =>
      renderComponent(StatusCell, {
        status: row.original.status,
        durationSec: row.original.durationSec,
      }),
  },
  {
    accessorKey: 'branch',
    header: 'Source',
    filterFn: inList,
    cell: ({ row }) =>
      renderComponent(SourceCell, { deployment: row.original }),
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    filterFn: withinDays,
    cell: ({ row }) =>
      renderComponent(CreatedCell, {
        createdAt: row.original.createdAt,
        author: row.original.author,
      }),
  },
  // Searchable text that isn't its own visible column
  { accessorKey: 'sha' },
  { accessorKey: 'message' },
  { accessorKey: 'author' },
]

/** Columns that exist only for filtering and search */
export const hiddenColumns = {
  environment: false,
  sha: false,
  message: false,
  author: false,
}
