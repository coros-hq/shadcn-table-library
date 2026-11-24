import type { ColumnDef } from '@tanstack/svelte-table'
import type { V9Features } from '$lib/table-v9-features'

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
