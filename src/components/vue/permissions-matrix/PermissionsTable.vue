<script setup lang="ts">
import { ref } from 'vue'
import {
  FlexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import type { ExpandedState } from '@tanstack/vue-table'
import { valueUpdater, cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TooltipProvider } from '@/components/ui/tooltip'
import { columns, rows } from './columns'
import type { MatrixMeta } from './columns'

const props = defineProps<MatrixMeta>()

const expanded = ref<ExpandedState>(true)

const table = useVueTable({
  data: rows,
  columns,
  getRowId: (row) => row.id,
  getSubRows: (row) => row.subRows,
  getCoreRowModel: getCoreRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  state: {
    get expanded() {
      return expanded.value
    },
  },
  onExpandedChange: (updater) => valueUpdater(updater, expanded),
  // A getter, so cells read the current role and grants on every render
  get meta() {
    return {
      roleId: props.roleId,
      grants: props.grants,
      changed: props.changed,
      setCells: props.setCells,
    }
  },
})
</script>

<template>
  <TooltipProvider :delay-duration="200">
    <div class="overflow-x-auto rounded-md border">
      <Table class="min-w-[600px]">
        <TableHeader>
          <TableRow
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
            class="hover:bg-transparent"
          >
            <TableHead
              v-for="header in headerGroup.headers"
              :key="header.id"
              :class="
                cn(
                  'h-auto py-2.5',
                  header.column.id === 'resource'
                    ? 'sticky left-0 z-10 bg-background'
                    : 'w-20 text-center',
                  header.column.id === 'all' && 'border-l',
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
          <!-- Cells paint the row color themselves: the pinned name column must be opaque -->
          <TableRow
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            class="group/row hover:bg-transparent has-aria-expanded:bg-transparent"
          >
            <TableCell
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
              :class="
                cn(
                  row.getCanExpand()
                    ? 'bg-muted'
                    : 'bg-background group-hover/row:bg-[color-mix(in_oklab,var(--muted)_50%,var(--background))]',
                  cell.column.id === 'resource'
                    ? 'sticky left-0 z-10 max-w-40 sm:max-w-64'
                    : 'text-center [&>*]:align-middle',
                  cell.column.id === 'all' && 'border-l',
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
      </Table>
    </div>
  </TooltipProvider>
</template>
