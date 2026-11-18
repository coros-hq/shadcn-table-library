<script setup lang="ts">
import { computed } from 'vue'
import { FolderOpen } from '@lucide/vue'
import {
  FlexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import type {
  ExpandedState,
  RowSelectionState,
  SortingState,
} from '@tanstack/vue-table'
import { cn, valueUpdater } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { columns } from './columns'
import type { BrowserMeta } from './columns'
import type { FolderEntry } from './data'
import FileDetails from './FileDetails.vue'
import { sortEntries } from './files'
import type { SortKey } from './files'

const props = defineProps<{
  folder: FolderEntry
  /** The folders from the root to `folder`, for the details' location */
  path: FolderEntry[]
  meta: BrowserMeta
}>()

// Owned by the demo, which resets them when the folder changes
const sorting = defineModel<SortingState>('sorting', { required: true })
const rowSelection = defineModel<RowSelectionState>('rowSelection', {
  required: true,
})
const expanded = defineModel<ExpandedState>('expanded', { required: true })

// Secondary columns step aside on small screens; the details row has them
const responsive: Record<string, string> = {
  kind: 'hidden md:table-cell',
  owner: 'hidden lg:table-cell',
  modified: 'hidden sm:table-cell',
}

// Sorted here rather than by TanStack, so folders stay on top either way
const entries = computed(() => {
  const sort = sorting.value.at(0)
  return sortEntries(
    props.folder.children,
    sort
      ? { id: sort.id as SortKey, desc: sort.desc }
      : { id: 'name', desc: false },
  )
})

const table = useVueTable({
  get data() {
    return entries.value
  },
  columns,
  getRowId: (entry) => entry.id,
  getRowCanExpand: (row) => row.original.kind === 'file',
  getCoreRowModel: getCoreRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  manualSorting: true,
  enableMultiSort: false,
  state: {
    get sorting() {
      return sorting.value
    },
    get rowSelection() {
      return rowSelection.value
    },
    get expanded() {
      return expanded.value
    },
  },
  onSortingChange: (updater) => valueUpdater(updater, sorting),
  onRowSelectionChange: (updater) => valueUpdater(updater, rowSelection),
  onExpandedChange: (updater) => valueUpdater(updater, expanded),
  get meta() {
    return props.meta
  },
})

const ariaSort = (sorted: false | 'asc' | 'desc') =>
  sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined
</script>

<template>
  <div class="overflow-hidden rounded-md border">
    <Table>
      <TableHeader>
        <TableRow
          v-for="group in table.getHeaderGroups()"
          :key="group.id"
          class="hover:bg-transparent"
        >
          <TableHead
            v-for="header in group.headers"
            :key="header.id"
            :aria-sort="ariaSort(header.column.getIsSorted())"
            :class="
              cn(
                responsive[header.column.id],
                header.column.id === 'select' && 'w-10',
                header.column.id === 'size' && 'w-28',
              )
            "
          >
            <FlexRender
              :render="header.column.columnDef.header"
              :props="header.getContext()"
            />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="table.getRowModel().rows.length">
          <template v-for="row in table.getRowModel().rows" :key="row.id">
            <TableRow
              :data-state="row.getIsSelected() ? 'selected' : undefined"
              :class="cn(row.getIsExpanded() && 'border-b-0')"
            >
              <TableCell
                v-for="cell in row.getVisibleCells()"
                :key="cell.id"
                :class="
                  cn(
                    responsive[cell.column.id],
                    cell.column.id === 'name' && 'max-w-0 w-full',
                  )
                "
              >
                <FlexRender
                  :render="cell.column.columnDef.cell"
                  :props="cell.getContext()"
                />
              </TableCell>
            </TableRow>
            <TableRow
              v-if="row.getIsExpanded() && row.original.kind === 'file'"
              class="bg-muted/30 hover:bg-muted/30"
            >
              <TableCell />
              <TableCell :colspan="columns.length - 1">
                <FileDetails :file="row.original" :path="path" />
              </TableCell>
            </TableRow>
          </template>
        </template>
        <TableRow v-else class="hover:bg-transparent">
          <TableCell :colspan="columns.length" class="h-40">
            <div
              class="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground"
            >
              <FolderOpen aria-hidden="true" class="size-6" />
              This folder is empty
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
