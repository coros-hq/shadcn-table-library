<script setup lang="ts" generic="TData">
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
  title: string
  options: { value: string; label: string }[]
}>()
</script>

<template>
  <Select
    :model-value="props.column?.getFilterValue() as string | undefined"
    @update:model-value="(val) => props.column?.setFilterValue(val)"
  >
    <SelectTrigger class="w-45">
      <SelectValue :placeholder="title" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
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
