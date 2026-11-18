<script setup lang="ts">
import { FlexRender, getCoreRowModel, useVueTable } from '@tanstack/vue-table'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { columns } from './columns'
import { cohorts } from './data'
import { hue } from './styles'
import type { CohortMeta } from './styles'

const props = defineProps<{ meta: CohortMeta }>()

const table = useVueTable({
  data: cohorts,
  columns,
  getRowId: (cohort) => cohort.id,
  getCoreRowModel: getCoreRowModel(),
  get meta() {
    return props.meta
  },
})

const isMonth = (id: string) => /^m\d+$/.test(id)
// The cohort column stays put while the months scroll on small screens
const sticky = 'sticky left-0 z-10 bg-background'
</script>

<template>
  <div :class="cn('overflow-hidden rounded-md border', hue)">
    <Table class="min-w-[860px]">
      <TableHeader>
        <TableRow
          v-for="group in table.getHeaderGroups()"
          :key="group.id"
          class="hover:bg-transparent"
        >
          <TableHead
            v-for="header in group.headers"
            :key="header.id"
            :colspan="header.colSpan"
            :class="
              cn(
                'h-8',
                header.column.id === 'cohort' && sticky,
                isMonth(header.column.id) && 'w-14 px-0.5',
                header.column.id === 'months' && 'border-b',
              )
            "
          >
            <FlexRender
              v-if="!header.isPlaceholder"
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
          :aria-current="meta.highlighted === row.id ? 'true' : undefined"
          :class="
            cn(
              'border-0 transition-opacity hover:bg-transparent motion-reduce:transition-none',
              meta.highlighted !== null &&
                meta.highlighted !== row.id &&
                'opacity-35',
              meta.highlighted === row.id &&
                'shadow-[inset_3px_0_0_var(--color-primary)]',
            )
          "
        >
          <TableCell
            v-for="cell in row.getVisibleCells()"
            :key="cell.id"
            :class="
              cn(
                'py-0.5',
                cell.column.id === 'cohort' && sticky,
                isMonth(cell.column.id) && 'px-0.5',
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
        <TableRow
          v-for="group in table.getFooterGroups().slice(0, 1)"
          :key="group.id"
          class="hover:bg-transparent"
        >
          <TableCell
            v-for="header in group.headers"
            :key="header.id"
            :class="
              cn(
                'py-1.5',
                header.column.id === 'cohort' && sticky,
                isMonth(header.column.id) && 'px-0.5',
              )
            "
          >
            <FlexRender
              v-if="!header.isPlaceholder"
              :render="header.column.columnDef.footer"
              :props="header.getContext()"
            />
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  </div>
</template>
