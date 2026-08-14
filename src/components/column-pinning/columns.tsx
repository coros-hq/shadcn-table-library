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

const statusVariant: Record<Employee['status'], 'default' | 'secondary' | 'outline'> = {
  Active: 'default',
  'On leave': 'secondary',
  Inactive: 'outline',
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
      <Badge variant={statusVariant[row.original.status]}>
        {row.original.status}
      </Badge>
    ),
  },
]
