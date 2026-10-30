import type { ColumnDef } from '@tanstack/table-core'
import {
  renderComponent,
  renderSnippet,
} from '$lib/components/ui/data-table/index.js'
import { createRawSnippet } from 'svelte'
import CustomerCell from './CustomerCell.svelte'
import DateCell from './DateCell.svelte'
import MoneyCell from './MoneyCell.svelte'
import StatusBadge from './StatusBadge.svelte'
import TransactionId from './TransactionId.svelte'
import type { Transaction } from './data'

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: 'id',
    header: 'Transaction',
    cell: ({ row }) => renderComponent(TransactionId, { id: row.original.id }),
  },
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
      renderComponent(MoneyCell, { amount: row.original.amount }),
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) =>
      renderComponent(DateCell, { createdAt: row.original.createdAt }),
  },
]
