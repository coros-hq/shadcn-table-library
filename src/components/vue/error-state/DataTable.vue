<script setup lang="ts">
import { computed } from 'vue'
import { FlexRender, getCoreRowModel, useVueTable } from '@tanstack/vue-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import ErrorState from './ErrorState.vue'
import { columns } from './columns'
import type { Invoice } from './data'

const props = withDefaults(
  defineProps<{
    data: Invoice[]
    error?: Error | null
    isRetrying?: boolean
  }>(),
  { error: null, isRetrying: false },
)

const emit = defineEmits<{ retry: [] }>()

const table = useVueTable({
  get data() {
    return props.data
  },
  columns,
  getCoreRowModel: getCoreRowModel(),
})

// With rows already on screen, keep them and show the error as a banner;
// with nothing to show, the error takes the place of the body.
const hasStaleData = computed(() => table.getRowModel().rows.length > 0)
</script>

<template>
  <div class="space-y-3">
    <ErrorState
      v-if="error && hasStaleData"
      variant="banner"
      title="Couldn't refresh invoices"
      :description="`${error.message}. Showing the last loaded data.`"
      :is-retrying="isRetrying"
      @retry="emit('retry')"
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
          <template v-if="hasStaleData">
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
              <ErrorState
                v-if="error"
                title="Something went wrong"
                :description="`${error.message}. Check your connection and try again.`"
                :is-retrying="isRetrying"
                @retry="emit('retry')"
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
