<script setup lang="ts" generic="TData">
import { computed } from 'vue'
import type { Column } from '@tanstack/vue-table'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const props = defineProps<{
  column?: Column<TData, unknown>
  label: string
  allLabel: string
  options: string[]
}>()

const value = computed(
  () => (props.column?.getFilterValue() as string | undefined) ?? 'all',
)
</script>

<template>
  <Select
    :model-value="value"
    @update:model-value="
      (next) => column?.setFilterValue(next === 'all' ? undefined : next)
    "
  >
    <SelectTrigger class="w-40" :aria-label="`Filter by ${label}`">
      <SelectValue :placeholder="label" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectItem value="all">{{ allLabel }}</SelectItem>
        <SelectItem v-for="option in options" :key="option" :value="option">
          {{ option }}
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>
