import type { ColumnDef } from '@tanstack/svelte-table'
import type { V9Features } from '$lib/table-v9-features'

export type Task = {
  id: string
  title: string
  priority: string
  status: string
}

export const columns: ColumnDef<V9Features, Task>[] = [
  {
    id: 'title',
    accessorKey: 'title',
    header: 'Title',
  },
  {
    id: 'priority',
    accessorKey: 'priority',
    header: 'Priority',
    sortFn: 'basic',
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    sortFn: 'basic',
  },
]
