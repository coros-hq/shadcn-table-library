<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  FlexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import type { ExpandedState } from '@tanstack/vue-table'
import { cn, valueUpdater } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { columns } from './columns'
import type { QueueMeta } from './columns'
import type { Job } from './data'
import JobErrors from './JobErrors.vue'
import { hasErrors } from './queue'
import type { View } from './queue'

const props = defineProps<{ jobs: Job[]; view: View; meta: QueueMeta }>()

const expanded = ref<ExpandedState>({})
// Computed: a new filter array on every tick would refilter for nothing
const columnFilters = computed(() =>
  props.view === 'all' ? [] : [{ id: 'status', value: props.view }],
)

const table = useVueTable({
  get data() {
    return props.jobs
  },
  columns,
  // Ids keep a row (and whether it's expanded) stable while jobs update
  getRowId: (job) => job.id,
  getRowCanExpand: (row) => hasErrors(row.original),
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  state: {
    get expanded() {
      return expanded.value
    },
    get columnFilters() {
      return columnFilters.value
    },
  },
  onExpandedChange: (updater) => valueUpdater(updater, expanded),
  // The data changes several times a second; nothing should reset with it
  autoResetExpanded: false,
  autoResetPageIndex: false,
  get meta() {
    return props.meta
  },
})
</script>

<template>
  <div class="overflow-hidden rounded-md border">
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
            :class="cn(header.column.id === 'expand' && 'w-10')"
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
              :class="
                cn(
                  row.original.status === 'failed' &&
                    'bg-destructive/[0.03] hover:bg-destructive/[0.06]',
                  row.getIsExpanded() && 'border-b-0',
                )
              "
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
            <TableRow v-if="row.getIsExpanded()" class="hover:bg-transparent">
              <TableCell
                :colspan="columns.length"
                class="bg-muted/30 py-4 pr-4 pl-12 whitespace-normal"
              >
                <JobErrors :job="row.original" />
              </TableCell>
            </TableRow>
          </template>
        </template>
        <TableRow v-else class="hover:bg-transparent">
          <TableCell
            :colspan="columns.length"
            class="h-24 text-center text-muted-foreground"
          >
            {{ view === 'failed' ? 'No failed jobs.' : `No ${view} jobs.` }}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
