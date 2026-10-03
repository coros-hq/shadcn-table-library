import type { ColumnDef } from '@tanstack/vue-table'

export type User = {
  id: number
  name: string
  email: string
  role: string
  status: string
}

export const columns: ColumnDef<User>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'status', header: 'Status' },
]
