import type { ColumnDef } from '@tanstack/vue-table'

export type TeamMember = {
  id: string
  name: string
  email: string
  role: string
}

export const columns: ColumnDef<TeamMember>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
]
