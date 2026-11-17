<script setup lang="ts">
import { computed, watch } from 'vue'
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
import { cn } from '@/lib/utils'
import { columns } from './columns'
import type { ReviewMeta } from './columns'
import { rowState } from './diff'
import type { View } from './diff'
import type { CatalogRow } from './data'

const props = defineProps<{
  rows: CatalogRow[]
  view: View
  /** The product whose diff is open, highlighted while the panel shows it */
  openId: string | null
  meta: ReviewMeta
}>()

// Computed: a new filter value on every read would recompute the rows each
// time. It changes with the decisions, so "To review" drops rows as they are decided.
const columnFilters = computed(() =>
  props.view === 'all'
    ? []
    : [
        {
          id: 'product',
          value: { view: props.view, decisions: props.meta.decisions },
        },
      ],
)

const table = useVueTable({
  get data() {
    return props.rows
  },
  columns,
  getRowId: (row) => row.id,
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  state: {
    get columnFilters() {
      return columnFilters.value
    },
  },
  autoResetPageIndex: false,
  get meta() {
    return props.meta
  },
})

// Stepping through products keeps the open one in view
watch(
  () => props.openId,
  (id) => {
    if (id) {
      document
        .querySelector(`[data-review-id="${id}"]`)
        ?.scrollIntoView({ block: 'nearest' })
    }
  },
  { flush: 'post' },
)

function rowClass(row: CatalogRow) {
  const state = row.change ? rowState(row.change, props.meta.decisions) : null
  return cn(
    row.change && 'cursor-pointer',
    // Rows waiting for review stand out; everything else stays quiet
    (state === 'pending' || state === 'partial') &&
      'bg-amber-500/[0.07] shadow-[inset_3px_0_0_var(--color-amber-500)] hover:bg-amber-500/[0.12]',
    state === 'rejected' && 'text-muted-foreground',
  )
}
</script>

<template>
  <div class="max-h-[36rem] min-h-[28rem] min-w-0 flex-1 overflow-auto">
    <Table>
      <TableHeader>
        <TableRow
          v-for="headerGroup in table.getHeaderGroups()"
          :key="headerGroup.id"
          class="hover:bg-transparent"
        >
          <TableHead v-for="header in headerGroup.headers" :key="header.id">
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
            :data-state="row.id === openId ? 'selected' : undefined"
            :class="rowClass(row.original)"
            @click="row.original.change && meta.open(row.id)"
          >
            <TableCell
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
              class="py-2.5"
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
              view === 'review'
                ? 'Everything has been reviewed.'
                : `No ${view} changes.`
            }}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
