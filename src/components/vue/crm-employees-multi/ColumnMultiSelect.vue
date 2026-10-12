<script setup lang="ts" generic="TData">
import { computed } from 'vue'
import type { Column } from '@tanstack/vue-table'
import MultiSelectFilter from './MultiSelectFilter.vue'

const props = defineProps<{
  column?: Column<TData, unknown>
  title: string
  options: string[]
}>()

// Counts come from the faceted model, which ignores this column's own filter,
// so the numbers stay meaningful while you are still picking options.
const facetedOptions = computed(() => {
  const facets = props.column?.getFacetedUniqueValues()
  return props.options.map((option) => ({
    label: option,
    value: option,
    count: facets?.get(option) ?? 0,
  }))
})

const selected = computed(
  () => (props.column?.getFilterValue() as string[] | undefined) ?? [],
)

// An empty array would still count as an active filter and hide every row,
// so clearing the last option removes the filter entirely.
function onChange(values: string[]) {
  props.column?.setFilterValue(values.length ? values : undefined)
}
</script>

<template>
  <MultiSelectFilter
    :title="title"
    :options="facetedOptions"
    :selected="selected"
    @update:selected="onChange"
  />
</template>
