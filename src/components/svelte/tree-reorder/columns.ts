import type { ColumnDef } from '@tanstack/table-core'
import { renderComponent } from '$lib/components/ui/data-table/index.js'
import NameCell from './NameCell.svelte'

export type OrgNode = {
  id: string
  name: string
  role: string
  status: string
  children?: OrgNode[]
}

export const columns: ColumnDef<OrgNode>[] = [
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
