<script setup lang="ts">
import { computed } from 'vue'
import { FlexRender } from '@tanstack/vue-table'
import type { Table as TanStackTable } from '@tanstack/vue-table'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { columns } from './columns'
import { PAGE_SIZE } from './styles'
import type { TicketMeta, TicketRow } from './styles'

const props = defineProps<{
  table: TanStackTable<TicketRow>
  panelOpen: boolean
}>()

// With the panel open there is less room, and the panel shows priority and
// assignee anyway, so those two columns step aside
const hide = (id: string) =>
  props.panelOpen
    ? id === 'assignee' || id === 'priority'
      ? 'hidden'
      : ''
    : id === 'assignee'
      ? 'hidden md:table-cell'
      : ''

const openId = computed(() => (props.table.options.meta as TicketMeta).openId)
const pageIndex = computed(() => props.table.getState().pagination.pageIndex)
const total = computed(() => props.table.getPrePaginationRowModel().rows.length)

const ariaSort = (sorted: false | 'asc' | 'desc') =>
  sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined
</script>

<template>
  <div class="flex min-w-0 flex-1 flex-col">
    <!-- Scrolls on its own, so opening a ticket never moves the page -->
    <div class="max-h-[32rem] min-h-[28rem] flex-1 overflow-auto">
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
              :class="hide(header.column.id)"
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
            <TableRow
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              :data-ticket-row="row.id"
              :aria-current="row.id === openId ? 'true' : undefined"
              :class="
                cn(
                  row.id === openId &&
                    'bg-muted shadow-[inset_3px_0_0_var(--color-primary)] hover:bg-muted',
                )
              "
            >
              <TableCell
                v-for="cell in row.getVisibleCells()"
                :key="cell.id"
                :class="
                  cn(
                    hide(cell.column.id),
                    cell.column.id === 'subject' && 'w-full max-w-0',
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
          <TableRow v-else class="hover:bg-transparent">
            <TableCell
              :colspan="columns.length"
              class="h-40 text-center text-muted-foreground"
            >
              No tickets here.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
    <div class="flex items-center justify-between gap-2 border-t px-3 py-2">
      <p class="text-sm text-muted-foreground tabular-nums">
        {{
          total
            ? `${pageIndex * PAGE_SIZE + 1}–${Math.min(total, (pageIndex + 1) * PAGE_SIZE)} of ${total}`
            : 'No tickets'
        }}
      </p>
      <div class="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="!table.getCanPreviousPage()"
          @click="table.previousPage()"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="!table.getCanNextPage()"
          @click="table.nextPage()"
        >
          Next
        </Button>
      </div>
    </div>
  </div>
</template>
