import type { ColumnDef } from '@tanstack/svelte-table'
import type { V9Features } from '$lib/table-v9-features'

export type Employee = {
  id: string
  name: string
  email: string
  role: string
  status: string
}

export const columns: ColumnDef<V9Features, Employee>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'status', header: 'Status' },
]
