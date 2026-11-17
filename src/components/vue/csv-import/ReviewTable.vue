<script setup lang="ts">
import { computed } from 'vue'
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { buildColumns } from './columns'
import type { ReviewMeta } from './columns'
import type { ReviewRow, View } from './review'

const props = defineProps<{
  headers: string[]
  rows: ReviewRow[]
  view: View
  meta: ReviewMeta
}>()

const columns = computed(() => buildColumns(props.headers))
// A stable array: a new one on every read would recompute the filtered rows
// each time, and with them TanStack's automatic page reset
const columnFilters = computed(() =>
  props.view === 'all' ? [] : [{ id: 'status', value: props.view }],
)

const table = useVueTable({
  get data() {
    return props.rows
  },
  get columns() {
    return columns.value
  },
  // Row ids are the row's position in the file, so edits never move or reset a row
  getRowId: (row) => row.id,
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  state: {
    get columnFilters() {
      return columnFilters.value
    },
  },
  // No pagination here, so edits have no page to reset
  autoResetPageIndex: false,
  get meta() {
    return props.meta
  },
})
</script>

<template>
  <TooltipProvider :delay-duration="150">
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
            class="hover:bg-transparent"
          >
            <TableHead
              v-for="header in headerGroup.headers"
              :key="header.id"
              class="h-auto align-bottom"
            >
              <div class="flex min-h-9 items-center">
                <FlexRender
                  :render="header.column.columnDef.header"
                  :props="header.getContext()"
                />
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="table.getRowModel().rows.length">
            <TableRow
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              :class="
                cn(
                  row.original.status === 'skipped' &&
                    '[&>td:not(:first-child)]:opacity-50',
                )
              "
            >
              <TableCell
                v-for="cell in row.getVisibleCells()"
                :key="cell.id"
                class="py-1.5"
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
              class="h-24 text-center text-muted-foreground"
            >
              {{
                view === 'attention'
                  ? 'Nothing left to fix.'
                  : view === 'skipped'
                    ? 'No rows are skipped.'
                    : 'No rows here.'
              }}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </TooltipProvider>
</template>
