<script setup lang="ts">
import { nextTick, ref } from 'vue'
import {
  FlexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import type { ExpandedState, SortingState } from '@tanstack/vue-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn, valueUpdater } from '@/lib/utils'
import { columns } from './columns'
import type { Metric } from './data'
import MetricDetails from './MetricDetails.vue'
import type { AnomalyMeta } from './styles'

const props = defineProps<{
  /** Already filtered by the demo */
  metrics: Metric[]
  meta: AnomalyMeta
}>()

const sorting = ref<SortingState>([{ id: 'change', desc: true }])
const expanded = ref<ExpandedState>({})
const frame = ref<HTMLElement>()

// Secondary columns step aside on small screens
const responsive: Record<string, string> = {
  range: 'hidden md:table-cell',
  change: 'hidden sm:table-cell',
  kind: 'hidden sm:table-cell',
  // The two button columns give up their inner padding on phones
  expand: 'pr-0 sm:pr-2',
  review: 'pl-0 sm:pl-2',
}

const table = useVueTable({
  get data() {
    return props.metrics
  },
  columns,
  getRowId: (m) => m.id,
  // Every metric has a history to show
  getRowCanExpand: () => true,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  state: {
    get sorting() {
      return sorting.value
    },
    get expanded() {
      return expanded.value
    },
  },
  onSortingChange: (u) => valueUpdater(u, sorting),
  onExpandedChange: (u) => valueUpdater(u, expanded),
  get meta(): AnomalyMeta {
    return { ...props.meta, toggleReviewed }
  },
})

/**
 * When reviewed rows are hidden, the row leaves under the pointer: move
 * focus to the next row's review button (or its expand button if it's in
 * range) instead of letting it vanish.
 */
async function toggleReviewed(id: string) {
  const ids = table.getRowModel().rows.map((r) => r.original.id)
  const i = ids.indexOf(id)
  const next = ids.at(i + 1) ?? ids.at(i - 1)
  props.meta.toggleReviewed(id)
  await nextTick()
  if (!next || frame.value?.contains(document.activeElement)) return
  const row = frame.value?.querySelector(`[data-metric="${next}"]`)
  ;(
    row?.querySelector<HTMLElement>('[aria-pressed]') ??
    row?.querySelector<HTMLElement>('button')
  )?.focus()
}
</script>

<template>
  <div ref="frame" class="overflow-hidden rounded-md border">
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
            :class="
              cn(
                responsive[header.column.id],
                header.column.id === 'expand' && 'w-10',
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
              :data-metric="row.original.id"
              :class="
                cn(
                  row.getIsExpanded() && 'border-b-0',
                  meta.reviewed.has(row.original.id) && 'text-muted-foreground',
                )
              "
            >
              <TableCell
                v-for="cell in row.getVisibleCells()"
                :key="cell.id"
                :class="responsive[cell.column.id]"
              >
                <FlexRender
                  :render="cell.column.columnDef.cell"
                  :props="cell.getContext()"
                />
              </TableCell>
            </TableRow>
            <TableRow
              v-if="row.getIsExpanded()"
              class="bg-muted/30 hover:bg-muted/30"
            >
              <TableCell />
              <TableCell :colspan="columns.length - 1" class="py-4">
                <MetricDetails :metric="row.original" />
              </TableCell>
            </TableRow>
          </template>
        </template>
        <TableRow v-else class="hover:bg-transparent">
          <TableCell
            :colspan="columns.length"
            class="h-32 text-center text-muted-foreground"
          >
            Nothing to investigate here.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
