<script setup lang="ts">
import { format } from 'date-fns'
import { X } from '@lucide/vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ActiveFilter } from './type'

defineProps<{ filters: ActiveFilter[] }>()
defineEmits<{ remove: [columnId: string]; clearAll: [] }>()

function formatFilterLabel(f: ActiveFilter) {
  if (f.type === 'dateRange') {
    return `${f.columnId}: ${f.from ? format(f.from, 'MMM d') : '?'} - ${f.to ? format(f.to, 'MMM d') : '?'}`
  }
  return `${f.columnId}: ${f.values.join(', ')}`
}
</script>

<template>
  <div v-if="filters.length > 0" class="flex flex-wrap items-center gap-2">
    <Badge
      v-for="f in filters"
      :key="f.columnId"
      variant="secondary"
      class="gap-1 pr-1"
    >
      {{ formatFilterLabel(f) }}
      <button type="button" @click="$emit('remove', f.columnId)">
        <X class="h-3 w-3" />
      </button>
    </Badge>
    <Button variant="ghost" size="sm" @click="$emit('clearAll')">
      Clear all
    </Button>
  </div>
</template>
