'use client'

import type { ColumnDef } from '@tanstack/react-table'

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type User = {
  id: number
  name: string
  email: string
  role: string
  status: string
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    enableSorting: false,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    sortingFn: 'alphanumeric',
  },
  {
    accessorKey: 'role',
    header: 'Role',
    sortingFn: 'basic',
    filterFn: 'equalsString',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    sortingFn: 'basic',
    filterFn: 'equalsString',
  },
]
