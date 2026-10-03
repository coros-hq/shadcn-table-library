<script setup lang="ts">
import type { Table } from '@tanstack/vue-table'
import { Button } from '@/components/ui/button'
import type { LogEntry } from './data'
import { PAGE_SIZE } from './use-logs-table'

/** Grows the page instead of paging, so newest events stay on top */
defineProps<{ table: Table<LogEntry> }>()
</script>

<template>
  <div
    v-if="table.getRowModel().rows.length < table.getFilteredRowModel().rows.length"
    class="flex items-center justify-center gap-3"
  >
    <p class="text-sm text-muted-foreground tabular-nums">
      Showing {{ table.getRowModel().rows.length }} of
      {{ table.getFilteredRowModel().rows.length }}
    </p>
    <Button
      type="button"
      variant="outline"
      size="sm"
      class="h-8"
      @click="table.setPageSize((size) => size + PAGE_SIZE)"
    >
      Load older events
    </Button>
  </div>
</template>
