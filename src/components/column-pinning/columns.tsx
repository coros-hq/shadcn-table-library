'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '#/components/ui/badge'

export type Employee = {
  id: string
  name: string
  email: string
  department: string
  role: string
  location: string
  manager: string
  startDate: string
  status: 'Active' | 'On leave' | 'Inactive'
  salary: string
}

// Soft status pills: one hue per meaning, never the solid default badge
const statusStyle: Record<Employee['status'], string> = {
  Active: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  'On leave': 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  Inactive: 'bg-muted text-muted-foreground',
}

export const columns: ColumnDef<Employee>[] = [
  { accessorKey: 'name', header: 'Name', size: 180 },
  { accessorKey: 'email', header: 'Email', size: 220 },
  { accessorKey: 'department', header: 'Department', size: 160 },
  { accessorKey: 'role', header: 'Role', size: 160 },
  { accessorKey: 'location', header: 'Location', size: 160 },
  { accessorKey: 'manager', header: 'Manager', size: 160 },
  { accessorKey: 'startDate', header: 'Start Date', size: 140 },
  { accessorKey: 'salary', header: 'Salary', size: 140 },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 140,
    cell: ({ row }) => (
      <Badge variant="secondary" className={statusStyle[row.original.status]}>
        {row.original.status}
      </Badge>
    ),
  },
]
