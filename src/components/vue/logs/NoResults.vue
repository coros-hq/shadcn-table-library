<script setup lang="ts">
import type { Table } from '@tanstack/vue-table'
import { Button } from '@/components/ui/button'
import type { LogEntry } from './data'
import { clearFilters } from './toolbar'

defineProps<{ table: Table<LogEntry> }>()
</script>

<template>
  <p class="text-muted-foreground">No log events match these filters.</p>
  <Button type="button" variant="link" size="sm" @click="clearFilters(table)">
    Reset filters
  </Button>
</template>
