<script setup lang="ts" generic="TData extends { id: string }">
import { computed, ref } from 'vue'
import { useDraggable } from 'vue-draggable-plus'
import {
  FlexRender,
  getCoreRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import type { ColumnDef, SortingState } from '@tanstack/vue-table'
import { ArrowDown, ArrowUp, ArrowUpDown, GripVertical } from '@lucide/vue'
import { valueUpdater } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const props = defineProps<{
  columns: ColumnDef<TData, any>[]
}>()

// The parent owns the row order; dragging pushes the new order back through v-model
const data = defineModel<TData[]>('data', { required: true })

const sorting = ref<SortingState>([])
const dataIds = computed(() => data.value.map((row) => row.id))

const table = useVueTable({
  get data() {
    return data.value
  },
  get columns() {
    return props.columns
  },
  getRowId: (row) => row.id,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  onSortingChange: (updater) => valueUpdater(updater, sorting),
  state: {
    get sorting() {
      return sorting.value
    },
  },
})

function arrayMove<T>(list: T[], from: number, to: number) {
  const next = [...list]
  next.splice(to, 0, next.splice(from, 1)[0])
  return next
}

// SortableJS moves the DOM node itself. `customUpdate` skips the library's own
// list handling, so we put the node back (keeping Vue's keyed diff in sync) and
// reorder by row id — the same way whether or not a sort is active.
// (a selector is resolved inside this component's root element)
useDraggable('tbody', {
  handle: '[data-drag-handle]',
  animation: 150,
  customUpdate(evt) {
    evt.item.remove()
    evt.from.insertBefore(evt.item, evt.from.children[evt.oldIndex!] ?? null)

    const rows = table.getRowModel().rows
    const oldIndex = dataIds.value.indexOf(rows[evt.oldIndex!].original.id)
    const newIndex = dataIds.value.indexOf(rows[evt.newIndex!].original.id)
    if (oldIndex === newIndex) return
    data.value = arrayMove(data.value, oldIndex, newIndex)
  },
})
</script>

<template>
  <div class="overflow-hidden rounded-md border">
    <Table>
      <TableHeader>
        <TableRow
          v-for="headerGroup in table.getHeaderGroups()"
          :key="headerGroup.id"
        >
          <TableHead class="w-8" />
          <TableHead v-for="header in headerGroup.headers" :key="header.id">
            <span
              :class="
                header.column.getCanSort()
                  ? 'flex cursor-pointer select-none items-center gap-2'
                  : 'flex items-center gap-2'
              "
              @click="header.column.getToggleSortingHandler()?.($event)"
            >
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
              <template v-if="header.column.getCanSort()">
                <ArrowUp
                  v-if="header.column.getIsSorted() === 'asc'"
                  class="h-3 w-3"
                />
                <ArrowDown
                  v-else-if="header.column.getIsSorted() === 'desc'"
                  class="h-3 w-3"
                />
                <ArrowUpDown v-else class="h-3 w-3 opacity-50" />
              </template>
            </span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="table.getRowModel().rows.length">
          <TableRow v-for="row in table.getRowModel().rows" :key="row.id">
            <TableCell class="w-8">
              <button
                type="button"
                data-drag-handle
                class="cursor-grab text-muted-foreground active:cursor-grabbing"
                aria-label="Reorder row"
              >
                <GripVertical class="h-3.5 w-3.5" />
              </button>
            </TableCell>
            <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
              <FlexRender
                :render="cell.column.columnDef.cell"
                :props="cell.getContext()"
              />
            </TableCell>
          </TableRow>
        </template>
        <TableRow v-else>
          <TableCell :colspan="columns.length + 1" class="h-24 text-center">
            No results.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
