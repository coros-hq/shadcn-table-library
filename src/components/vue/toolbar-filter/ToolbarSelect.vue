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
  placeholder: string
  options: { value: string; label: string }[]
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
    <SelectTrigger class="w-40">
      <SelectValue :placeholder="placeholder" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectItem value="all">All {{ placeholder.toLowerCase() }}</SelectItem>
        <SelectItem
          v-for="option in options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>
