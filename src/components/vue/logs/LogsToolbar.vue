<script setup lang="ts">
import type { Table } from '@tanstack/vue-table'
import { Search, X } from '@lucide/vue'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { levels, services, statusClasses } from './data'
import type { LogEntry, LogLevel } from './data'
import DateRangeFilter from './DateRangeFilter.vue'
import FacetedFilter from './FacetedFilter.vue'
import LevelDot from './LevelDot.vue'
import { clearFilters, isFiltered } from './toolbar'

defineProps<{ table: Table<LogEntry> }>()
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <div class="relative w-full sm:w-auto sm:max-w-64 sm:min-w-40 sm:flex-1">
      <Search
        class="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        :model-value="table.getState().globalFilter as string"
        placeholder="Message, path, request id…"
        aria-label="Search logs"
        class="h-8 pl-8"
        @update:model-value="(value) => table.setGlobalFilter(String(value))"
      />
    </div>
    <div class="flex flex-wrap items-center gap-2 sm:ml-auto sm:justify-end">
      <Button
        v-if="isFiltered(table)"
        type="button"
        variant="ghost"
        size="sm"
        class="h-8 px-2"
        @click="clearFilters(table)"
      >
        Reset
        <X class="size-3.5" />
      </Button>
      <DateRangeFilter :column="table.getColumn('timestamp')" />
      <FacetedFilter
        :column="table.getColumn('level')"
        title="Level"
        :options="levels"
        :format-label="(level: string) => level[0].toUpperCase() + level.slice(1)"
      >
        <template #icon="{ value }">
          <LevelDot :level="value as LogLevel" />
        </template>
      </FacetedFilter>
      <FacetedFilter
        :column="table.getColumn('service')"
        title="Service"
        :options="services"
      />
      <FacetedFilter
        :column="table.getColumn('statusClass')"
        title="Status"
        :options="statusClasses"
      />
    </div>
  </div>
</template>
