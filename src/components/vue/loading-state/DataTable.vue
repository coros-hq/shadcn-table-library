<script setup lang="ts">
import { computed } from 'vue'
import { FlexRender, getCoreRowModel, useVueTable } from '@tanstack/vue-table'
import { cn } from '@/lib/utils'
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
import type { Invoice } from './data'

const props = withDefaults(
  defineProps<{
    data: Invoice[]
    /** First load: no data yet, so render placeholder rows */
    isLoading?: boolean
    /** Background refetch: keep the current rows and dim them */
    isFetching?: boolean
    skeletonRows?: number
  }>(),
  { isLoading: false, isFetching: false, skeletonRows: 5 },
)

// Varied widths so the placeholder rows read as content, not a grid of bars
const SKELETON_WIDTHS = ['w-3/4', 'w-1/2', 'w-2/3', 'w-5/6', 'w-1/3']

const table = useVueTable({
  get data() {
    return props.data
  },
  columns,
  getCoreRowModel: getCoreRowModel(),
})

const leafColumns = computed(() => table.getAllLeafColumns())
</script>

<template>
  <div
    class="relative overflow-hidden rounded-md border"
    :aria-busy="isLoading || isFetching"
  >
    <div
      v-if="isFetching && !isLoading"
      class="absolute inset-x-0 top-0 z-10 h-0.5 animate-pulse bg-primary"
    />
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
      <TableBody :class="cn(isFetching && 'opacity-60 transition-opacity')">
        <template v-if="isLoading">
          <TableRow
            v-for="rowIndex in skeletonRows"
            :key="rowIndex"
            class="hover:bg-transparent"
          >
            <TableCell
              v-for="(column, colIndex) in leafColumns"
              :key="column.id"
            >
              <Skeleton
                :class="
                  cn(
                    'h-4',
                    SKELETON_WIDTHS[
                      (rowIndex + colIndex) % SKELETON_WIDTHS.length
                    ],
                    column.id === 'amount' && 'ml-auto',
                  )
                "
              />
            </TableCell>
          </TableRow>
        </template>
        <template v-else>
          <TableRow v-for="row in table.getRowModel().rows" :key="row.id">
            <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
              <FlexRender
                :render="cell.column.columnDef.cell"
                :props="cell.getContext()"
              />
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>
</template>
