import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { ChevronRight } from '@lucide/vue'

export type OrgNode = {
  id: string
  name: string
  role: string
  status: string
  children?: OrgNode[]
}

export const columns: ColumnDef<OrgNode>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) =>
      h(
        'div',
        {
          class: 'flex items-center gap-1.5',
          style: { paddingLeft: `${row.depth * 1.25}rem` },
        },
        [
          row.getCanExpand()
            ? h(
                'button',
                {
                  type: 'button',
                  onClick: row.getToggleExpandedHandler(),
                  class:
                    'flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground',
                  'aria-label': row.getIsExpanded() ? 'Collapse row' : 'Expand row',
                },
                h(ChevronRight, {
                  class: [
                    'h-3.5 w-3.5 transition-transform',
                    row.getIsExpanded() && 'rotate-90',
                  ],
                }),
              )
            : h('span', { class: 'w-4 shrink-0' }),
          row.original.name,
        ],
      ),
  },
  {
    accessorKey: 'role',
    header: 'Role',
    sortingFn: 'alphanumeric',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    sortingFn: 'basic',
  },
]
