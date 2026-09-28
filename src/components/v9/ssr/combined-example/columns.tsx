'use client'

import type { ColumnDef } from '@tanstack/react-table-v9'
import type { V9Features } from '#/lib/table-v9-features.ts'

export type User = {
  id: number
  name: string
  email: string
  role: string
  status: string
}

export const columns: ColumnDef<V9Features, User>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'status', header: 'Status' },
]
