<script setup lang="ts" generic="TData, TValue">
import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import type { ColumnDef } from '@tanstack/vue-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

const props = defineProps<{
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}>()

const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  getCoreRowModel: getCoreRowModel(),
})
</script>

<template>
  <!--
    Below the @[48rem] (768px) container breakpoint, every table element is
    forced to `block`/`flex` and each <tr> becomes its own bordered card.
    Above it, the variant puts everything back to its normal table display —
    no JS media query, no separate mobile component. Tailwind's @[...]
    variants key off this container's own width via `@container`, not the
    viewport, so the same table card-ifies inside a narrow sidebar even on a
    wide desktop screen.
  -->
  <div class="@container rounded-md border">
    <Table class="block @[48rem]:table">
      <TableHeader class="hidden @[48rem]:table-header-group">
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
      <TableBody
        class="block space-y-3 @[48rem]:table-row-group @[48rem]:space-y-0"
      >
        <template v-if="table.getRowModel().rows.length">
          <TableRow
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            class="block rounded-lg border p-3 @[48rem]:table-row @[48rem]:rounded-none @[48rem]:border-0 @[48rem]:border-b @[48rem]:p-0 @[48rem]:last:border-b-0"
          >
            <TableCell
              v-for="(cell, cellIndex) in row.getVisibleCells()"
              :key="cell.id"
              :data-label="
                typeof cell.column.columnDef.header === 'string'
                  ? cell.column.columnDef.header
                  : undefined
              "
              :class="
                cn(
                  'flex items-center justify-between gap-4 py-1 @[48rem]:table-cell @[48rem]:py-3',
                  cellIndex === 0
                    ? 'mb-1 text-sm font-medium @[48rem]:mb-0 @[48rem]:font-normal'
                    : 'border-t py-1.5 first:border-t-0 @[48rem]:border-t-0 @[48rem]:py-3 before:content-[attr(data-label)] before:text-xs before:font-medium before:text-muted-foreground @[48rem]:before:content-none',
                )
              "
            >
              <FlexRender
                :render="cell.column.columnDef.cell"
                :props="cell.getContext()"
              />
            </TableCell>
          </TableRow>
        </template>
        <TableRow v-else class="block @[48rem]:table-row">
          <TableCell
            :colspan="columns.length"
            class="block h-24 text-center @[48rem]:table-cell"
          >
            No results.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
