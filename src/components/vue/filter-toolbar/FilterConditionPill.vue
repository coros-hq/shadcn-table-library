<script setup lang="ts" generic="TData">
import { computed, ref } from 'vue'
import type { Table } from '@tanstack/vue-table'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import FilterConditionEditor from './FilterConditionEditor.vue'
import { formatConditionValue, operatorRegistry } from './operators'
import type { FilterCondition } from './operators'
import './types'

const props = defineProps<{
  table: Table<TData>
  condition: FilterCondition
}>()

const open = ref(false)

const meta = computed(
  () => props.table.getColumn(props.condition.columnId)?.columnDef.meta,
)
const activeOperator = computed(() =>
  meta.value?.filterVariant
    ? operatorRegistry[meta.value.filterVariant].find(
        (o) => o.value === props.condition.operator,
      )
    : undefined,
)
const valueDisplay = computed(() =>
  meta.value?.filterVariant
    ? formatConditionValue(
        meta.value.filterVariant,
        activeOperator.value,
        props.condition.value,
        meta.value.filterOptions,
      )
    : '',
)

function apply(columnId: string, operator: string, value: unknown) {
  props.table.getColumn(columnId)?.setFilterValue({ operator, value })
  open.value = false
}

function remove() {
  props.table.getColumn(props.condition.columnId)?.setFilterValue(undefined)
  open.value = false
}
</script>

<template>
  <Popover v-if="meta?.filterVariant" v-model:open="open">
    <PopoverTrigger as-child>
      <Button type="button" variant="outline" size="sm">
        <span>{{ meta.label }}</span>
        <span class="text-muted-foreground">{{ activeOperator?.label }}</span>
        <span v-if="valueDisplay" class="font-medium">{{ valueDisplay }}</span>
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-64 p-0" align="start">
      <FilterConditionEditor
        :table="table"
        :column-id="condition.columnId"
        :initial-operator="condition.operator"
        :initial-value="condition.value"
        removable
        @apply="apply"
        @remove="remove"
      />
    </PopoverContent>
  </Popover>
</template>
