import { h } from 'vue'
import type { Column, ColumnDef, Table } from '@tanstack/vue-table'
import { ArrowDown, ArrowUp, ChevronRight } from '@lucide/vue'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { Entry } from './data'
import FileIcon from './FileIcon.vue'
import { formatDate, formatSize, itemCount, kindLabel, sizeOf } from './files'

export interface BrowserMeta {
  open: (folderId: string) => void
}

const getMeta = (table: Table<Entry>) =>
  table.options.meta as unknown as BrowserMeta

function sortHeader(
  column: Column<Entry>,
  label: string,
  align: 'left' | 'right' = 'left',
) {
  const sorted = column.getIsSorted()
  return h(
    'button',
    {
      type: 'button',
      onClick: column.getToggleSortingHandler(),
      class: cn(
        'group/sort inline-flex items-center gap-1 rounded-sm outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50',
        align === 'right' && 'ml-auto flex-row-reverse',
      ),
    },
    [
      label,
      h(sorted === 'desc' ? ArrowDown : ArrowUp, {
        'aria-hidden': 'true',
        class: cn(
          'size-3.5',
          !sorted && 'opacity-0 group-hover/sort:opacity-40',
        ),
      }),
    ],
  )
}

const nameButton =
  'flex min-w-0 items-center gap-2 rounded-sm text-left outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50'

export const columns: ColumnDef<Entry>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      h(Checkbox, {
        'aria-label': 'Select everything in this folder',
        disabled: !table.getRowCount(),
        modelValue: table.getIsAllRowsSelected()
          ? true
          : table.getIsSomeRowsSelected()
            ? 'indeterminate'
            : false,
        'onUpdate:modelValue': (on: boolean | 'indeterminate') =>
          table.toggleAllRowsSelected(!!on),
      }),
    cell: ({ row }) =>
      h(Checkbox, {
        'aria-label': `Select ${row.original.name}`,
        modelValue: row.getIsSelected(),
        'onUpdate:modelValue': (on: boolean | 'indeterminate') =>
          row.toggleSelected(!!on),
      }),
  },
  {
    id: 'name',
    accessorFn: (entry) => entry.name,
    header: ({ column }) => sortHeader(column, 'Name'),
    cell: ({ row, table }) => {
      const entry = row.original
      const name = h('span', { class: 'truncate' }, entry.name)
      // A folder's name opens it; a file's name shows its details
      if (entry.kind === 'folder') {
        return h(
          'button',
          {
            type: 'button',
            'data-entry': entry.id,
            onClick: () => getMeta(table).open(entry.id),
            class: cn(nameButton, 'font-medium'),
          },
          [h(FileIcon, { entry }), name],
        )
      }
      return h(
        'button',
        {
          type: 'button',
          'data-entry': entry.id,
          'aria-expanded': row.getIsExpanded(),
          onClick: row.getToggleExpandedHandler(),
          class: nameButton,
        },
        [
          h(FileIcon, { entry }),
          name,
          h(ChevronRight, {
            'aria-hidden': 'true',
            class: cn(
              'size-3.5 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none',
              row.getIsExpanded() && 'rotate-90',
            ),
          }),
          h(
            'span',
            { class: 'sr-only' },
            `, ${row.getIsExpanded() ? 'hide' : 'show'} details`,
          ),
        ],
      )
    },
  },
  {
    id: 'kind',
    header: 'Type',
    cell: ({ row }) =>
      h('span', { class: 'text-muted-foreground' }, kindLabel(row.original)),
  },
  {
    id: 'size',
    accessorFn: (entry) => sizeOf(entry),
    header: ({ column }) =>
      h('div', { class: 'flex' }, [sortHeader(column, 'Size', 'right')]),
    cell: ({ row }) =>
      h(
        'span',
        { class: 'block text-right text-muted-foreground tabular-nums' },
        row.original.kind === 'folder'
          ? itemCount(row.original)
          : formatSize(row.original.size),
      ),
  },
  {
    id: 'modified',
    accessorFn: (entry) => entry.modified,
    header: ({ column }) => sortHeader(column, 'Modified'),
    cell: ({ row }) =>
      h(
        'span',
        { class: 'whitespace-nowrap text-muted-foreground tabular-nums' },
        formatDate(row.original.modified),
      ),
  },
  {
    id: 'owner',
    header: 'Owner',
    cell: ({ row }) =>
      h(
        'span',
        { class: 'whitespace-nowrap text-muted-foreground' },
        row.original.owner,
      ),
  },
]
