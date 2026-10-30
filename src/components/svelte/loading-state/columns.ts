import { createRawSnippet } from 'svelte'
import type { ColumnDef } from '@tanstack/table-core'
import {
  renderComponent,
  renderSnippet,
} from '$lib/components/ui/data-table/index.js'
import AmountCell from './AmountCell.svelte'
import CustomerCell from './CustomerCell.svelte'
import StatusBadge from './StatusBadge.svelte'
import type { Invoice } from './data'

export const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: 'customer',
    header: 'Customer',
    cell: ({ row }) =>
      renderComponent(CustomerCell, {
        customer: row.original.customer,
        email: row.original.email,
      }),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) =>
      renderComponent(StatusBadge, { status: row.original.status }),
  },
  {
    accessorKey: 'amount',
    header: () =>
      renderSnippet(
        createRawSnippet(() => ({
          render: () => `<div class="text-right">Amount</div>`,
        })),
      ),
    cell: ({ row }) =>
      renderComponent(AmountCell, { amount: row.original.amount }),
  },
  { accessorKey: 'dueDate', header: 'Due' },
]
