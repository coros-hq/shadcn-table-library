'use client'

import type { ColumnDef } from '@tanstack/react-table-v9'
import type { V9Features } from '#/lib/table-v9-features.ts'

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type User = {
  id: number
  name: string
  email: string
  role: string
  status: string
}

export const columns: ColumnDef<V9Features, User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    enableSorting: false,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    sortFn: 'alphanumeric',
  },
  {
    accessorKey: 'role',
    header: 'Role',
    sortFn: 'basic',
    filterFn: 'equalsString',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    sortFn: 'basic',
    filterFn: 'equalsString',
  },
]
