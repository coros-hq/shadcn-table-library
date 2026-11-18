import type { ColumnDef, Table } from '@tanstack/table-core'
import { renderComponent } from '$lib/components/ui/data-table/index.js'
import type { Entry } from './data'
import { formatDate, formatSize, itemCount, kindLabel, sizeOf } from './files'
import NameCell from './NameCell.svelte'
import SelectCheckbox from './SelectCheckbox.svelte'
import SortHeader from './SortHeader.svelte'
import TextCell from './TextCell.svelte'

export interface BrowserMeta {
  open: (folderId: string) => void
}

const getMeta = (table: Table<Entry>) =>
  table.options.meta as unknown as BrowserMeta

const muted = 'text-muted-foreground'

export const columns: ColumnDef<Entry>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      renderComponent(SelectCheckbox, {
        checked: table.getIsAllRowsSelected(),
        indeterminate:
          !table.getIsAllRowsSelected() && table.getIsSomeRowsSelected(),
        disabled: !table.getRowCount(),
        onchange: (on: boolean) => table.toggleAllRowsSelected(on),
        label: 'Select everything in this folder',
      }),
    cell: ({ row }) =>
      renderComponent(SelectCheckbox, {
        checked: row.getIsSelected(),
        onchange: (on: boolean) => row.toggleSelected(on),
        label: `Select ${row.original.name}`,
      }),
  },
  {
    id: 'name',
    accessorFn: (entry) => entry.name,
    header: ({ column }) =>
      renderComponent(SortHeader, { column, label: 'Name' }),
    cell: ({ row, table }) =>
      renderComponent(NameCell, {
        entry: row.original,
        expanded: row.getIsExpanded(),
        onopen: () => getMeta(table).open(row.original.id),
        ontoggle: () => row.toggleExpanded(),
      }),
  },
  {
    id: 'kind',
    header: 'Type',
    cell: ({ row }) =>
      renderComponent(TextCell, {
        text: kindLabel(row.original),
        class: muted,
      }),
  },
  {
    id: 'size',
    accessorFn: (entry) => sizeOf(entry),
    header: ({ column }) =>
      renderComponent(SortHeader, { column, label: 'Size', align: 'right' }),
    cell: ({ row }) =>
      renderComponent(TextCell, {
        text:
          row.original.kind === 'folder'
            ? itemCount(row.original)
            : formatSize(row.original.size),
        class: `block text-right tabular-nums ${muted}`,
      }),
  },
  {
    id: 'modified',
    accessorFn: (entry) => entry.modified,
    header: ({ column }) =>
      renderComponent(SortHeader, { column, label: 'Modified' }),
    cell: ({ row }) =>
      renderComponent(TextCell, {
        text: formatDate(row.original.modified),
        class: `whitespace-nowrap tabular-nums ${muted}`,
      }),
  },
  {
    id: 'owner',
    header: 'Owner',
    cell: ({ row }) =>
      renderComponent(TextCell, {
        text: row.original.owner,
        class: `whitespace-nowrap ${muted}`,
      }),
  },
]
