'use client'

import type { ColumnDef } from '@tanstack/react-table'

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  id: string
  amount: number
  status: 'pending' | 'processing' | 'success' | 'failed'
  email: string
}

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: 'status',
    header: 'Status',
    enableSorting: false,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    sortingFn: 'alphanumeric',
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    sortingFn: 'basic',
  },
]
