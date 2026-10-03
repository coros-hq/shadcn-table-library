import type { ColumnDef } from '@tanstack/vue-table'

export type Employee = {
  id: string
  name: string
  email: string
  role: string
  status: string
}

export const columns: ColumnDef<Employee>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'status', header: 'Status' },
]
