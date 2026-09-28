'use client'

import { createColumnHelper } from '@tanstack/react-table-v9'
import { v9Features } from '#/lib/table-v9-features.ts'

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type User = {
  id: number
  name: string
  email: string
  role: string
  status: string
}

const columnHelper = createColumnHelper<typeof v9Features, User>()

export const columns = columnHelper.columns([
  columnHelper.accessor('name', {
    header: 'Name',
    enableSorting: false,
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    sortFn: 'alphanumeric',
  }),
  columnHelper.accessor('role', {
    header: 'Role',
    sortFn: 'basic',
    filterFn: 'equalsString',
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    sortFn: 'basic',
    filterFn: 'equalsString',
  }),
])
