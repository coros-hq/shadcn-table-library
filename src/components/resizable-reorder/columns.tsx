'use client'

import type { ColumnDef } from '@tanstack/react-table'

export type User = {
  id: string
  name: string
  email: string
  role: string
  status: string
}

export const columns: ColumnDef<User>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Name',
    size: 180,
    minSize: 100,
    maxSize: 400,
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: 'Email',
    size: 220,
    minSize: 140,
    maxSize: 400,
  },
  {
    id: 'role',
    accessorKey: 'role',
    header: 'Role',
    size: 140,
    minSize: 80,
    maxSize: 300,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    size: 120,
    minSize: 80,
    maxSize: 300,
  },
]
