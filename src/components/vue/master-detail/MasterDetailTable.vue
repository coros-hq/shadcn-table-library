<script setup lang="ts">
import { h, ref } from 'vue'
import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import type { ColumnDef } from '@tanstack/vue-table'
import { ChevronRight } from '@lucide/vue'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Order } from './columns'
import OrderDetail from './OrderDetail.vue'

const props = defineProps<{
  columns: ColumnDef<Order, any>[]
  data: Order[]
}>()

const expandedRows = ref<Set<string>>(new Set())

function toggleRow(id: string) {
  const next = new Set(expandedRows.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  expandedRows.value = next
}

// The expander cell reads `expandedRows` while rendering, so only the
// affected rows update when one is toggled.
const allColumns: ColumnDef<Order, any>[] = [
  {
    id: 'expander',
    header: () => null,
    cell: ({ row }) => {
      const isExpanded = expandedRows.value.has(row.original.id)
      return h(
        'button',
        {
          type: 'button',
          onClick: () => toggleRow(row.original.id),
          class: 'flex h-4 w-4 items-center justify-center text-muted-foreground',
          'aria-label': isExpanded ? 'Collapse row' : 'Expand row',
          'aria-expanded': isExpanded,
        },
        h(ChevronRight, {
          class: ['h-3.5 w-3.5 transition-transform', isExpanded && 'rotate-90'],
        }),
      )
    },
  },
  ...props.columns,
]

const table = useVueTable({
  get data() {
    return props.data
  },
  columns: allColumns,
  getCoreRowModel: getCoreRowModel(),
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
          <template v-for="row in table.getRowModel().rows" :key="row.id">
            <TableRow
              :data-state="expandedRows.has(row.original.id) ? 'expanded' : undefined"
            >
              <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                <FlexRender
                  :render="cell.column.columnDef.cell"
                  :props="cell.getContext()"
                />
              </TableCell>
            </TableRow>
            <TableRow v-if="expandedRows.has(row.original.id)">
              <TableCell :colspan="allColumns.length" class="bg-muted/30 p-4">
                <OrderDetail :order="row.original" />
              </TableCell>
            </TableRow>
          </template>
        </template>
        <TableRow v-else>
          <TableCell :colspan="allColumns.length" class="h-24 text-center">
            No results.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
