import type { ColumnDef } from '@tanstack/table-core'
import { renderComponent } from '$lib/components/ui/data-table/index.js'
import NameCell from './NameCell.svelte'
import SelectCheckbox from './SelectCheckbox.svelte'

export type OrgNode = {
  id: string
  name: string
  role: string
  status: string
  children?: OrgNode[]
}

export const columns: ColumnDef<OrgNode>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      renderComponent(SelectCheckbox, {
        checked: table.getIsAllRowsSelected(),
        indeterminate:
          !table.getIsAllRowsSelected() && table.getIsSomeRowsSelected(),
        onchange: (value) => table.toggleAllRowsSelected(value),
        label: 'Select all rows',
      }),
    cell: ({ row }) =>
      renderComponent(SelectCheckbox, {
        checked: row.getIsSelected(),
        indeterminate: !row.getIsSelected() && row.getIsSomeSelected(),
        onchange: (value) => row.toggleSelected(value),
        label: 'Select row',
      }),
    enableSorting: false,
  },
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
    sortingFn: 'alphanumeric',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    sortingFn: 'basic',
  },
]
