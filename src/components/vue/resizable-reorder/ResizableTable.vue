<script setup lang="ts" generic="TData, TValue">
import { onMounted, ref, watch } from 'vue'
import { useDraggable } from 'vue-draggable-plus'
import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import type { ColumnDef } from '@tanstack/vue-table'
import { GripVertical } from '@lucide/vue'
import { cn, valueUpdater } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'resizable-table-layout'

interface StoredLayout {
  columnOrder?: string[]
  columnSizing?: Record<string, number>
}

function loadLayout(): StoredLayout {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const props = defineProps<{
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}>()

const defaultOrder = () => props.columns.map((c) => c.id as string)

const columnOrder = ref<string[]>(defaultOrder())
const columnSizing = ref<Record<string, number>>({})
let isHydrated = false

// Restore the saved layout after mount, then persist every change
onMounted(() => {
  const saved = loadLayout()
  if (saved.columnOrder) columnOrder.value = saved.columnOrder
  if (saved.columnSizing) columnSizing.value = saved.columnSizing
  isHydrated = true
})

watch([columnOrder, columnSizing], () => {
  if (!isHydrated) return
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      columnOrder: columnOrder.value,
      columnSizing: columnSizing.value,
    }),
  )
})

const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  state: {
    get columnOrder() {
      return columnOrder.value
    },
    get columnSizing() {
      return columnSizing.value
    },
  },
  onColumnOrderChange: (updater) => valueUpdater(updater, columnOrder),
  onColumnSizingChange: (updater) => valueUpdater(updater, columnSizing),
  columnResizeMode: 'onChange',
  enableColumnResizing: true,
  getCoreRowModel: getCoreRowModel(),
})

function arrayMove<T>(list: T[], from: number, to: number) {
  const next = [...list]
  next.splice(to, 0, next.splice(from, 1)[0])
  return next
}

// SortableJS moves the header cell itself; put it back (keeping Vue's keyed
// diff in sync) and let TanStack's columnOrder state drive the new layout.
useDraggable('thead tr', {
  handle: '[data-drag-handle]',
  direction: 'horizontal',
  animation: 150,
  customUpdate(evt) {
    evt.item.remove()
    evt.from.insertBefore(evt.item, evt.from.children[evt.oldIndex!] ?? null)
    columnOrder.value = arrayMove(columnOrder.value, evt.oldIndex!, evt.newIndex!)
  },
})

function resetLayout() {
  window.localStorage.removeItem(STORAGE_KEY)
  columnOrder.value = defaultOrder()
  columnSizing.value = {}
}
</script>

<template>
  <div>
    <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
      <p class="text-sm text-muted-foreground">
        Drag a header's grip to reorder, drag its right edge to resize.
      </p>
      <Button type="button" variant="outline" size="sm" @click="resetLayout">
        Reset layout
      </Button>
    </div>
    <div class="overflow-x-auto rounded-md border">
      <Table :style="{ width: `${table.getTotalSize()}px` }">
        <TableHeader>
          <TableRow
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
          >
            <TableHead
              v-for="header in headerGroup.headers"
              :key="header.id"
              class="select-none"
              :style="{ width: `${header.getSize()}px`, position: 'relative' }"
            >
              <div class="flex items-center gap-1.5 pr-2">
                <button
                  type="button"
                  data-drag-handle
                  class="cursor-grab text-muted-foreground active:cursor-grabbing"
                  aria-label="Reorder column"
                >
                  <GripVertical class="h-3.5 w-3.5" />
                </button>
                <span>
                  <FlexRender
                    v-if="!header.isPlaceholder"
                    :render="header.column.columnDef.header"
                    :props="header.getContext()"
                  />
                </span>
              </div>
              <div
                :class="
                  cn(
                    'absolute top-0 right-0 h-full w-1 cursor-col-resize touch-none bg-border opacity-0 select-none hover:opacity-100',
                    header.column.getIsResizing() && 'bg-primary opacity-100',
                  )
                "
                @mousedown="header.getResizeHandler()($event)"
                @touchstart="header.getResizeHandler()($event)"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="row in table.getRowModel().rows" :key="row.id">
            <TableCell
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
              :style="{ width: `${cell.column.getSize()}px` }"
            >
              <FlexRender
                :render="cell.column.columnDef.cell"
                :props="cell.getContext()"
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
