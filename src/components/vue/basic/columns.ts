import type { ColumnDef } from '@tanstack/vue-table'

// This type is used to define the shape of our data.
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
