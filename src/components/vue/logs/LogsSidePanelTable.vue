<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { FlexRender } from '@tanstack/vue-table'
import type { ColumnDef } from '@tanstack/vue-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { LogEntry } from './data'
import LoadOlderEvents from './LoadOlderEvents.vue'
import LogPanel from './LogPanel.vue'
import LogsToolbar from './LogsToolbar.vue'
import NoResults from './NoResults.vue'
import { useLogsTable } from './use-logs-table'

// The panel takes the room these columns would use; its header repeats them
const hiddenWhileOpen = { service: false, statusClass: false }

const props = defineProps<{
  columns: ColumnDef<LogEntry, any>[]
  data: LogEntry[]
}>()

const selectedId = ref<string | null>(null)

const table = useLogsTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  state: {
    get columnVisibility() {
      return selectedId.value ? hiddenWhileOpen : {}
    },
  },
})

const rows = computed(() => table.getRowModel().rows)
const selectedIndex = computed(() =>
  rows.value.findIndex((row) => row.id === selectedId.value),
)
const selected = computed(() =>
  selectedIndex.value === -1 ? undefined : rows.value[selectedIndex.value],
)

// A filter can remove the selected event; close the panel instead of
// showing details for a row that is no longer in the table
watch(selected, (row) => {
  if (selectedId.value && !row) selectedId.value = null
})

function selectAt(index: number) {
  const row = rows.value.at(index)
  if (index < 0 || !row) return
  selectedId.value = row.id
  document.getElementById(`log-row-${row.id}`)?.focus()
}

function onRowKeyDown(e: KeyboardEvent, index: number) {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault()
    selectAt(index + (e.key === 'ArrowDown' ? 1 : -1))
  } else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    const id = rows.value[index].id
    selectedId.value = id === selectedId.value ? null : id
  } else if (e.key === 'Escape') {
    selectedId.value = null
  }
}
</script>

<template>
  <div class="space-y-3">
    <LogsToolbar :table="table" />

    <!-- overflow-clip (not hidden) keeps the rounded corners without
         breaking the panel's sticky positioning -->
    <div class="relative flex overflow-clip rounded-md border">
      <div class="min-w-0 flex-1">
        <Table>
          <TableHeader>
            <TableRow
              v-for="headerGroup in table.getHeaderGroups()"
              :key="headerGroup.id"
            >
              <TableHead
                v-for="header in headerGroup.headers"
                :key="header.id"
                :class="cn('h-9 text-xs', header.column.id === 'message' && 'w-full')"
              >
                <FlexRender
                  :render="header.column.columnDef.header"
                  :props="header.getContext()"
                />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <template v-if="rows.length">
              <TableRow
                v-for="(row, index) in rows"
                :id="`log-row-${row.id}`"
                :key="row.id"
                tabindex="0"
                :aria-selected="row.id === selectedId"
                :data-state="row.id === selectedId ? 'selected' : undefined"
                :class="
                  cn(
                    'cursor-pointer outline-none focus-visible:bg-muted/60',
                    row.original.level === 'error' &&
                      'bg-red-500/[0.04] dark:bg-red-500/[0.07]',
                  )
                "
                @click="selectedId = row.id === selectedId ? null : row.id"
                @keydown="(e: KeyboardEvent) => onRowKeyDown(e, index)"
              >
                <TableCell
                  v-for="cell in row.getVisibleCells()"
                  :key="cell.id"
                  :class="
                    cn(
                      'py-2',
                      // max-w-0 lets the message take the leftover width and truncate
                      cell.column.id === 'message' && 'max-w-0 min-w-32',
                    )
                  "
                >
                  <FlexRender
                    :render="cell.column.columnDef.cell"
                    :props="cell.getContext()"
                  />
                </TableCell>
              </TableRow>
            </template>
            <TableRow v-else>
              <TableCell
                :colspan="table.getVisibleLeafColumns().length"
                class="h-32 text-center"
              >
                <NoResults :table="table" />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <LogPanel
        v-if="selected"
        :row="selected"
        :can-previous="selectedIndex > 0"
        :can-next="selectedIndex < rows.length - 1"
        @previous="selectAt(selectedIndex - 1)"
        @next="selectAt(selectedIndex + 1)"
        @close="selectedId = null"
      />
    </div>

    <LoadOlderEvents :table="table" />
  </div>
</template>
