<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { columns } from './columns'
import { useInfiniteRows } from './use-infinite-rows'
import type { InfinitePage } from './use-infinite-rows'
import type { Transaction } from './data'

const SKELETON_ROWS = 4

const props = defineProps<{
  fetchPage: (cursor: number) => Promise<InfinitePage<Transaction>>
  total: number
}>()

const { rows, status, hasMore, canAutoLoad, loadMore } = useInfiniteRows(
  props.fetchPage,
)
const scrollRef = ref<HTMLDivElement | null>(null)
const sentinelRef = ref<HTMLDivElement | null>(null)

const table = useVueTable({
  get data() {
    return rows.value
  },
  columns,
  getCoreRowModel: getCoreRowModel(),
})

// Reads rows.length so a fresh observer is created after every page: it
// reports the sentinel's current position straight away, which keeps loading
// when a page was too short to push the sentinel out of view.
watchEffect(
  (onCleanup) => {
    void rows.value.length
    const sentinel = sentinelRef.value
    if (!canAutoLoad.value || !sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void loadMore()
      },
      { root: scrollRef.value, rootMargin: '0px 0px 160px 0px' },
    )
    observer.observe(sentinel)
    onCleanup(() => observer.disconnect())
  },
  { flush: 'post' },
)
</script>

<template>
  <div>
    <div
      ref="scrollRef"
      class="max-h-96 overflow-auto rounded-md border [&_[data-slot=table-container]]:overflow-visible"
    >
      <Table>
        <TableHeader
          class="sticky top-0 z-10 bg-background shadow-[0_1px_0_var(--border)] [&_tr]:border-b-0"
        >
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
          <TableRow v-for="row in table.getRowModel().rows" :key="row.id">
            <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
              <FlexRender
                :render="cell.column.columnDef.cell"
                :props="cell.getContext()"
              />
            </TableCell>
          </TableRow>
          <template v-if="status === 'loading'">
            <TableRow v-for="i in SKELETON_ROWS" :key="`skeleton-${i}`" aria-hidden="true">
              <TableCell v-for="(_column, j) in columns" :key="j">
                <Skeleton class="h-4 w-full max-w-28" />
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
      <div ref="sentinelRef" class="h-px" aria-hidden="true" />
      <div
        v-if="status === 'error'"
        role="alert"
        class="flex items-center justify-center gap-3 border-t p-3 text-sm"
      >
        <span class="text-muted-foreground">Couldn't load more transactions.</span>
        <Button size="sm" variant="outline" @click="loadMore">Retry</Button>
      </div>
    </div>
    <p class="mt-3 text-xs text-muted-foreground tabular-nums" aria-live="polite">
      {{
        hasMore
          ? `Showing ${rows.length} of ${total} — scroll for more`
          : `All ${total} transactions loaded`
      }}
    </p>
  </div>
</template>
