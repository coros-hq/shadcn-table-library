<script setup lang="ts">
import { FlexRender, getCoreRowModel, useVueTable } from '@tanstack/vue-table'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { columns } from './columns'
import type { DraftMeta, Row } from './types'

const props = defineProps<{
  rows: Row[]
  meta: DraftMeta
  /** Ids of rows that were just saved, highlighted for a moment */
  fresh: Set<string>
}>()

const table = useVueTable({
  get data() {
    return props.rows
  },
  columns,
  // Stable ids keep each input, and the focus in it, across keystrokes
  getRowId: (row) => row.id,
  getCoreRowModel: getCoreRowModel(),
  get meta() {
    return props.meta
  },
})
</script>

<template>
  <div class="overflow-hidden rounded-md border">
    <Table class="min-w-[640px]">
      <TableHeader>
        <TableRow
          v-for="group in table.getHeaderGroups()"
          :key="group.id"
          class="hover:bg-transparent"
        >
          <TableHead
            v-for="header in group.headers"
            :key="header.id"
            :class="
              cn(
                (header.column.id === 'amount' ||
                  header.column.id === 'actions') &&
                  'w-32',
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
        <TableRow
          v-for="row in table.getRowModel().rows"
          :key="row.id"
          :data-kind="row.original.kind"
          :class="
            cn(
              'transition-colors duration-1000',
              row.original.kind === 'draft' &&
                'bg-sky-500/10 hover:bg-sky-500/10',
              fresh.has(row.id) && 'bg-emerald-500/10',
            )
          "
        >
          <TableCell
            v-for="(cell, i) in row.getVisibleCells()"
            :key="cell.id"
            :class="
              cn(
                row.original.kind === 'draft' ? 'py-1.5 align-top' : 'h-11',
                // A blue edge marks the rows that aren't saved yet
                row.original.kind === 'draft' &&
                  i === 0 &&
                  'shadow-[inset_3px_0_0_var(--color-blue-500)]',
              )
            "
          >
            <FlexRender
              :render="cell.column.columnDef.cell"
              :props="cell.getContext()"
            />
          </TableCell>
        </TableRow>
      </TableBody>
      <TableFooter class="bg-transparent">
        <TableRow class="hover:bg-transparent">
          <TableCell :colspan="columns.length" class="p-1.5">
            <slot name="footer" />
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  </div>
</template>
