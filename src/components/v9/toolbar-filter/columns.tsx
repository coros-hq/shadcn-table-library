'use client'

import type { ColumnDef } from '@tanstack/react-table-v9'
import type { V9Features } from '#/lib/table-v9-features.ts'

export type Task = {
  id: string
  title: string
  category: string
  priority: string
  status: string
}

export const columns: ColumnDef<V9Features, Task>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
  },
  {
    accessorKey: 'category',
    header: 'Category',
    filterFn: 'equalsString',
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    filterFn: 'equalsString',
  },
]
