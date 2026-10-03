<script setup lang="ts" generic="TData">
import { computed } from 'vue'
import type { Table } from '@tanstack/vue-table'
import AddFilterTrigger from './AddFilterTrigger.vue'
import FilterConditionPill from './FilterConditionPill.vue'
import { useFilterConditions } from './use-filter-conditions'
import './types'

const props = defineProps<{ table: Table<TData> }>()

const conditions = useFilterConditions(props.table)

const filterableColumns = computed(() =>
  props.table
    .getAllColumns()
    .filter((column) => column.columnDef.meta?.filterVariant),
)

const availableColumnIds = computed(() => {
  const activeColumnIds = new Set(conditions.value.map((c) => c.columnId))
  return filterableColumns.value
    .filter((column) => !activeColumnIds.has(column.id))
    .map((column) => column.id)
})
</script>

<template>
  <div
    v-if="filterableColumns.length > 0"
    class="flex flex-wrap items-center gap-2"
  >
    <FilterConditionPill
      v-for="condition in conditions"
      :key="condition.columnId"
      :table="table"
      :condition="condition"
    />

    <AddFilterTrigger
      v-if="availableColumnIds.length > 0"
      :table="table"
      :available-column-ids="availableColumnIds"
    />
  </div>
</template>
