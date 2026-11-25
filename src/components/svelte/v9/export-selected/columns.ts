import { renderComponent, type ColumnDef } from '@tanstack/svelte-table'
import type { V9Features } from '$lib/table-v9-features'
import MrrCell from './MrrCell.svelte'
import PlanBadge from './PlanBadge.svelte'
import SelectCheckbox from './SelectCheckbox.svelte'

export type Customer = {
  id: string
  name: string
  email: string
  company: string
  plan: 'Free' | 'Pro' | 'Enterprise'
  mrr: number
}

export const columns: ColumnDef<V9Features, Customer>[] = [
  {
    id: 'select',
    // The header box reflects the current page, so it matches what the user sees
    header: ({ table }) =>
      renderComponent(SelectCheckbox, {
        checked: table.getIsAllPageRowsSelected(),
        indeterminate:
          !table.getIsAllPageRowsSelected() &&
          table.getIsSomePageRowsSelected(),
        onchange: (value) => table.toggleAllPageRowsSelected(value),
        label: 'Select all rows on this page',
      }),
    cell: ({ row }) =>
      renderComponent(SelectCheckbox, {
        checked: row.getIsSelected(),
        onchange: (value) => row.toggleSelected(value),
        label: `Select ${row.original.name}`,
      }),
    enableHiding: false,
  },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'company', header: 'Company' },
  {
    accessorKey: 'plan',
    header: 'Plan',
    cell: ({ row }) => renderComponent(PlanBadge, { plan: row.original.plan }),
  },
  {
    accessorKey: 'mrr',
    header: 'MRR',
    cell: ({ row }) => renderComponent(MrrCell, { mrr: row.original.mrr }),
  },
]
