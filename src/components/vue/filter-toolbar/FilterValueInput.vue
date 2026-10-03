<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import MultiSelectFilter from '@/components/ui/multi-select-filter/MultiSelectFilter.vue'
import DateRangeFilter from './DateRangeFilter.vue'
import type { OperatorDef } from './operators'
import type { DateRangeValue, FilterOption, FilterVariant } from './types'

/**
 * Renders the value control for a condition's valueShape/variant pair.
 * `operator.valueShape` decides whether anything renders at all ("is empty"
 * needs no value); `variant` decides which control fills a given shape,
 * reusing the same DateRangeFilter/MultiSelectFilter used elsewhere.
 */
defineProps<{
  label: string
  variant: FilterVariant
  operator: OperatorDef
  options?: FilterOption[]
}>()

const value = defineModel<unknown>('value')

const input = ref<{ $el: HTMLInputElement } | null>(null)
onMounted(() => input.value?.$el.focus())
</script>

<template>
  <template v-if="operator.valueShape !== 'none'">
    <Input
      v-if="variant === 'text'"
      ref="input"
      placeholder="Value"
      class="w-full"
      :model-value="(value as string | undefined) ?? ''"
      @update:model-value="(next) => (value = String(next))"
    />

    <Input
      v-else-if="variant === 'number'"
      ref="input"
      type="number"
      placeholder="Value"
      class="w-full"
      :model-value="(value as number | undefined) ?? ''"
      @input="
        (e: Event) => {
          const el = e.target as HTMLInputElement
          value = el.value === '' ? undefined : el.valueAsNumber
        }
      "
    />

    <Select
      v-else-if="variant === 'select'"
      :model-value="(value as string | undefined) ?? ''"
      @update:model-value="(next) => (value = next)"
    >
      <SelectTrigger class="w-full">
        <SelectValue placeholder="Select value" />
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

    <MultiSelectFilter
      v-else-if="variant === 'multiSelect'"
      :title="label"
      :options="options ?? []"
      :selected="(value as string[] | undefined) ?? []"
      @update:selected="(next) => (value = next)"
    />

    <DateRangeFilter
      v-else-if="variant === 'dateRange'"
      :label="label"
      :value="value as DateRangeValue | undefined"
      @update:value="(next) => (value = next)"
    />
  </template>
</template>
