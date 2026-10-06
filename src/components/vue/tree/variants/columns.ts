import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import {
  Backpack,
  Camera,
  Droplet,
  Headphones,
  Shirt,
  Watch,
} from '@lucide/vue'

import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import ProductActions from './ProductActions.vue'
import type { Product, ProductKind, StockStatus } from './data'

const icons = {
  backpack: Backpack,
  headphones: Headphones,
  bottle: Droplet,
  watch: Watch,
  jacket: Shirt,
  camera: Camera,
} satisfies Record<ProductKind, unknown>

const statusDot: Record<StockStatus, string> = {
  Ready: 'bg-emerald-500',
  Low: 'bg-amber-500',
  Backorder: 'bg-red-500',
}

const number = new Intl.NumberFormat('en-US')
const date = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})

// The bracket that links variants to their parent's thumbnail: a vertical
// rule with a rounded elbow into each variant, ending on the last one.
const connector = (isLast: boolean) => [
  h('span', {
    'aria-hidden': 'true',
    class:
      'absolute top-0 left-1/2 h-1/2 w-3 rounded-bl-lg border-b-2 border-l-2 border-border',
  }),
  !isLast &&
    h('span', {
      'aria-hidden': 'true',
      class: 'absolute top-1/2 bottom-0 left-1/2 border-l-2 border-border',
    }),
]

export const columns: ColumnDef<Product>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      h(Checkbox, {
        modelValue: table.getIsAllRowsSelected()
          ? true
          : table.getIsSomeRowsSelected()
            ? 'indeterminate'
            : false,
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          table.toggleAllRowsSelected(!!value),
        'aria-label': 'Select all products',
      }),
    cell: ({ row }) =>
      row.depth === 0
        ? h(Checkbox, {
            modelValue: row.getIsSelected(),
            'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
              row.toggleSelected(!!value),
            'aria-label': `Select ${row.original.name}`,
          })
        : null,
    size: 32,
  },
  {
    id: 'thumbnail',
    header: () => h('span', { class: 'sr-only' }, 'Image'),
    cell: ({ row }) => {
      if (row.depth > 0) {
        const siblings = row.getParentRow()?.subRows ?? []
        return connector(row.index === siblings.length - 1)
      }
      return [
        h(
          'div',
          {
            class:
              'flex size-9 items-center justify-center rounded-lg bg-muted',
          },
          h(icons[row.original.kind], { class: 'size-5' }),
        ),
        row.getIsExpanded() &&
          h('span', {
            'aria-hidden': 'true',
            class:
              'absolute top-[calc(50%+1.125rem)] bottom-0 left-1/2 border-l-2 border-border',
          }),
      ]
    },
    size: 48,
  },
  {
    accessorKey: 'name',
    header: 'Product',
    cell: ({ row }) =>
      h(
        'span',
        {
          class: cn(
            'block max-w-44 truncate',
            row.depth > 0 && 'text-muted-foreground',
          ),
          title: row.original.name,
        },
        row.original.name,
      ),
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
    cell: ({ row }) =>
      row.getCanExpand()
        ? h(
            'button',
            {
              type: 'button',
              onClick: row.getToggleExpandedHandler(),
              'aria-expanded': row.getIsExpanded(),
              'aria-label': `${row.getIsExpanded() ? 'Hide' : 'Show'} variants of ${row.original.name}`,
              class:
                'text-sm underline underline-offset-4 hover:text-foreground',
            },
            `${row.getIsExpanded() ? 'Hide' : 'Show'} variants`,
          )
        : h('span', { class: 'font-mono text-xs' }, row.original.sku),
  },
  {
    accessorKey: 'stock',
    header: 'Stock',
    cell: ({ row }) =>
      h(
        'span',
        { class: 'inline-flex items-center gap-2 whitespace-nowrap tabular-nums' },
        [
          number.format(row.original.stock),
          h(
            'span',
            {
              class:
                'inline-flex items-center gap-1.5 text-xs text-muted-foreground',
            },
            [
              h('span', {
                'aria-hidden': 'true',
                class: cn(
                  'size-1.5 rounded-full',
                  statusDot[row.original.status],
                ),
              }),
              row.original.status,
            ],
          ),
        ],
      ),
  },
  {
    accessorKey: 'reserved',
    header: () => h('div', { class: 'text-right' }, 'Reserved'),
    cell: ({ row }) =>
      h(
        'div',
        { class: 'text-right tabular-nums' },
        number.format(row.original.reserved),
      ),
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated',
    cell: ({ row }) =>
      h(
        'span',
        { class: 'whitespace-nowrap text-muted-foreground' },
        date.format(new Date(row.original.updatedAt)),
      ),
  },
  {
    id: 'actions',
    header: () => h('span', { class: 'sr-only' }, 'Actions'),
    cell: ({ row }) =>
      row.depth === 0
        ? h(ProductActions, { name: row.original.name })
        : null,
    size: 72,
  },
]
