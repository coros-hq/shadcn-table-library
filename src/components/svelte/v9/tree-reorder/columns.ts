import { renderComponent, type ColumnDef } from '@tanstack/svelte-table'
import type { V9Features } from '$lib/table-v9-features'
import NameCell from './NameCell.svelte'

export type OrgNode = {
  id: string
  name: string
  role: string
  status: string
  children?: OrgNode[]
}

export const columns: ColumnDef<V9Features, OrgNode>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) =>
      renderComponent(NameCell, {
        name: row.original.name,
        depth: row.depth,
        canExpand: row.getCanExpand(),
        expanded: row.getIsExpanded(),
        onToggle: row.getToggleExpandedHandler(),
      }),
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
]
