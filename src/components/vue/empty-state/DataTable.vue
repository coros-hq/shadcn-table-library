<script setup lang="ts">
import { ref } from 'vue'
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import { Inbox, Plus, SearchX } from '@lucide/vue'
import { valueUpdater } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import EmptyState from './EmptyState.vue'
import { columns } from './columns'
import type { Invoice } from './data'

const props = defineProps<{
  data: Invoice[]
}>()

const emit = defineEmits<{ create: [] }>()

const globalFilter = ref('')

const table = useVueTable({
  get data() {
    return props.data
  },
  columns,
  state: {
    get globalFilter() {
      return globalFilter.value
    },
  },
  onGlobalFilterChange: (updater) => valueUpdater(updater, globalFilter),
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
})
</script>

<template>
  <div class="space-y-3">
    <Input
      v-model="globalFilter"
      placeholder="Search invoices..."
      :disabled="data.length === 0"
      class="max-w-xs"
    />
    <div class="overflow-hidden rounded-md border">
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
        <TableBody>
          <template v-if="table.getRowModel().rows.length">
            <TableRow v-for="row in table.getRowModel().rows" :key="row.id">
              <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                <FlexRender
                  :render="cell.column.columnDef.cell"
                  :props="cell.getContext()"
                />
              </TableCell>
            </TableRow>
          </template>
          <TableRow v-else class="hover:bg-transparent">
            <TableCell :colspan="columns.length" class="p-0">
              <!-- Two different empties: nothing exists yet vs. nothing matches the filter -->
              <EmptyState
                v-if="data.length === 0"
                title="No invoices yet"
                description="Invoices you create will show up here so you can track what's paid and what's overdue."
              >
                <template #icon><Inbox /></template>
                <template #action>
                  <Button size="sm" @click="emit('create')">
                    <Plus /> Create invoice
                  </Button>
                </template>
              </EmptyState>
              <EmptyState
                v-else
                title="No results found"
                :description="`Nothing matches &quot;${globalFilter}&quot;. Try a different search term.`"
              >
                <template #icon><SearchX /></template>
                <template #action>
                  <Button
                    variant="outline"
                    size="sm"
                    @click="globalFilter = ''"
                  >
                    Clear search
                  </Button>
                </template>
              </EmptyState>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
