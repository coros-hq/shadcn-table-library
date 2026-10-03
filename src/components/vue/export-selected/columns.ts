import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

export type Customer = {
  id: string
  name: string
  email: string
  company: string
  plan: 'Free' | 'Pro' | 'Enterprise'
  mrr: number
}

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export const columns: ColumnDef<Customer>[] = [
  {
    id: 'select',
    // The header box reflects the current page, so it matches what the user sees
    header: ({ table }) =>
      h(Checkbox, {
        modelValue: table.getIsAllPageRowsSelected()
          ? true
          : table.getIsSomePageRowsSelected()
            ? 'indeterminate'
            : false,
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          table.toggleAllPageRowsSelected(!!value),
        'aria-label': 'Select all rows on this page',
      }),
    cell: ({ row }) =>
      h(Checkbox, {
        modelValue: row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          row.toggleSelected(!!value),
        'aria-label': `Select ${row.original.name}`,
      }),
    enableHiding: false,
  },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'company', header: 'Company' },
  {
    accessorKey: 'plan',
    header: 'Plan',
    cell: ({ row }) =>
      h(
        Badge,
        { variant: row.original.plan === 'Enterprise' ? 'default' : 'secondary' },
        () => row.original.plan,
      ),
  },
  {
    accessorKey: 'mrr',
    header: 'MRR',
    cell: ({ row }) =>
      h('span', { class: 'tabular-nums' }, usd.format(row.original.mrr)),
  },
]
