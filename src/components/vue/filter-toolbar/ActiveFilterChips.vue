<script setup lang="ts" generic="TData">
import { X } from '@lucide/vue'
import type { Table } from '@tanstack/vue-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useActiveFilters } from './use-active-filters'

const props = defineProps<{ table: Table<TData> }>()

const activeFilters = useActiveFilters(props.table)
</script>

<template>
  <div v-if="activeFilters.length > 0" class="flex flex-wrap items-center gap-2">
    <Badge
      v-for="filter in activeFilters"
      :key="filter.columnId"
      variant="secondary"
      class="gap-1 pr-1"
    >
      {{ filter.label }} {{ filter.display }}
      <button
        type="button"
        :aria-label="`Remove ${filter.label} filter`"
        @click="table.getColumn(filter.columnId)?.setFilterValue(undefined)"
      >
        <X class="h-3 w-3" />
      </button>
    </Badge>
    <Button variant="ghost" size="sm" @click="table.resetColumnFilters()">
      Clear all
    </Button>
  </div>
</template>
