<script setup lang="ts" generic="TData extends { id: string; children?: TData[] }">
import { ref } from 'vue'
import { useDraggable } from 'vue-draggable-plus'
import {
  FlexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import type { ColumnDef, ExpandedState } from '@tanstack/vue-table'
import { GripVertical } from '@lucide/vue'
import { valueUpdater } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type TreeNode = { id: string; children?: TreeNode[] }

function arrayMove<T>(list: T[], from: number, to: number) {
  const next = [...list]
  next.splice(to, 0, next.splice(from, 1)[0])
  return next
}

// Moves `activeId` to `overId`'s slot, but only when both are siblings under
// the same parent — it walks the tree until it finds the level they share.
function reorderSiblings<T extends TreeNode>(
  nodes: T[],
  activeId: string,
  overId: string,
): { nodes: T[]; moved: boolean } {
  const oldIndex = nodes.findIndex((n) => n.id === activeId)
  const newIndex = nodes.findIndex((n) => n.id === overId)

  if (oldIndex !== -1 && newIndex !== -1) {
    return { nodes: arrayMove(nodes, oldIndex, newIndex), moved: true }
  }

  let moved = false
  const next = nodes.map((node) => {
    if (!node.children) return node
    const result = reorderSiblings(node.children as T[], activeId, overId)
    if (result.moved) moved = true
    return result.moved ? { ...node, children: result.nodes } : node
  })

  return { nodes: moved ? next : nodes, moved }
}

const props = defineProps<{
  columns: ColumnDef<TData, any>[]
}>()

// The parent owns the tree; a drop pushes the reordered tree back through v-model
const data = defineModel<TData[]>('data', { required: true })

const expanded = ref<ExpandedState>(true)

const table = useVueTable({
  get data() {
    return data.value
  },
  get columns() {
    return props.columns
  },
  getRowId: (row) => row.id,
  getCoreRowModel: getCoreRowModel(),
  getSubRows: (row) => row.children,
  getExpandedRowModel: getExpandedRowModel(),
  onExpandedChange: (updater) => valueUpdater(updater, expanded),
  state: {
    get expanded() {
      return expanded.value
    },
  },
})

// SortableJS moves the DOM node itself; put it back (keeping Vue's keyed diff
// in sync), then reorder the tree by row id.
useDraggable('tbody', {
  handle: '[data-drag-handle]',
  animation: 150,
  customUpdate(evt) {
    evt.item.remove()
    evt.from.insertBefore(evt.item, evt.from.children[evt.oldIndex!] ?? null)

    const rows = table.getRowModel().rows
    const activeId = rows[evt.oldIndex!].id
    const overId = rows[evt.newIndex!].id
    if (activeId === overId) return
    const result = reorderSiblings(data.value, activeId, overId)
    if (result.moved) data.value = result.nodes
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
            <FlexRender
              v-if="!header.isPlaceholder"
              :render="header.column.columnDef.header"
              :props="header.getContext()"
            />
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
