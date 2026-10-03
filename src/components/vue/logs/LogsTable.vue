<script setup lang="ts">
import { computed, h } from 'vue'
import { FlexRender, getExpandedRowModel } from '@tanstack/vue-table'
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
import { cn } from '@/lib/utils'
import type { LogEntry } from './data'
import LoadOlderEvents from './LoadOlderEvents.vue'
import LogFields from './LogFields.vue'
import LogsToolbar from './LogsToolbar.vue'
import NoResults from './NoResults.vue'
import { useLogsTable } from './use-logs-table'

const expandColumn: ColumnDef<LogEntry> = {
  id: 'expand',
  header: () => h('span', { class: 'sr-only' }, 'Details'),
  cell: ({ row }) =>
    h(
      'button',
      {
        type: 'button',
        'aria-label': row.getIsExpanded() ? 'Hide details' : 'Show details',
        'aria-expanded': row.getIsExpanded(),
        onClick: (e: MouseEvent) => {
          // The row itself also toggles on click; don't toggle twice
          e.stopPropagation()
          row.toggleExpanded()
        },
        class:
          'flex size-5 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground',
      },
      h(ChevronRight, {
        class: cn('size-3.5 transition-transform', row.getIsExpanded() && 'rotate-90'),
      }),
    ),
}

const props = defineProps<{
  columns: ColumnDef<LogEntry, any>[]
  data: LogEntry[]
}>()

const allColumns = computed(() => [expandColumn, ...props.columns])

const table = useLogsTable({
  get data() {
    return props.data
  },
  get columns() {
    return allColumns.value
  },
  getRowCanExpand: () => true,
  getExpandedRowModel: getExpandedRowModel(),
})
</script>

<template>
  <div class="space-y-3">
    <LogsToolbar :table="table" />

    <div class="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
          >
            <TableHead
              v-for="header in headerGroup.headers"
              :key="header.id"
              :class="
                cn(
                  'h-9 text-xs',
                  header.column.id === 'expand' && 'w-8 pr-0',
                  header.column.id === 'message' && 'w-full',
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
                :data-state="row.getIsExpanded() ? 'selected' : undefined"
                :class="
                  cn(
                    'cursor-pointer',
                    row.original.level === 'error' &&
                      'bg-red-500/[0.04] dark:bg-red-500/[0.07]',
                  )
                "
                @click="row.toggleExpanded()"
              >
                <TableCell
                  v-for="cell in row.getVisibleCells()"
                  :key="cell.id"
                  :class="
                    cn(
                      'py-2',
                      cell.column.id === 'expand' && 'pr-0',
                      // max-w-0 lets the message take the leftover width and truncate
                      cell.column.id === 'message' && 'max-w-0 min-w-40',
                    )
                  "
                >
                  <FlexRender
                    :render="cell.column.columnDef.cell"
                    :props="cell.getContext()"
                  />
                </TableCell>
              </TableRow>
              <TableRow v-if="row.getIsExpanded()" class="hover:bg-transparent">
                <TableCell
                  :colspan="row.getVisibleCells().length"
                  class="bg-muted/30 p-0"
                >
                  <LogFields :log="row.original" class="px-4 py-3 pl-12" />
                </TableCell>
              </TableRow>
            </template>
          </template>
          <TableRow v-else>
            <TableCell
              :colspan="table.getVisibleLeafColumns().length"
              class="h-32 text-center"
            >
              <NoResults :table="table" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <LoadOlderEvents :table="table" />
  </div>
</template>
