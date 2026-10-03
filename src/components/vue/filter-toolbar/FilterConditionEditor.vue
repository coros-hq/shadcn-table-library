<script setup lang="ts" generic="TData">
import { computed, ref } from 'vue'
import type { Table } from '@tanstack/vue-table'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import FilterValueInput from './FilterValueInput.vue'
import { isValueValid, operatorRegistry } from './operators'
import './types'

const props = withDefaults(
  defineProps<{
    table: Table<TData>
    /** Locked column — present when editing an existing condition. */
    columnId?: string
    /** Columns selectable in the "pick a column" step (add mode only). */
    availableColumnIds?: string[]
    initialOperator?: string
    initialValue?: unknown
    /** Show the Remove button (edit mode only). */
    removable?: boolean
  }>(),
  { availableColumnIds: () => [], removable: false },
)

const emit = defineEmits<{
  apply: [columnId: string, operator: string, value: unknown]
  remove: []
}>()

const columnId = ref<string | undefined>(props.columnId)
const operator = ref<string | undefined>(props.initialOperator)
const value = ref<unknown>(props.initialValue)

const meta = computed(() =>
  columnId.value
    ? props.table.getColumn(columnId.value)?.columnDef.meta
    : undefined,
)
const operators = computed(() =>
  meta.value?.filterVariant ? operatorRegistry[meta.value.filterVariant] : [],
)
const activeOperator = computed(() =>
  operators.value.find((o) => o.value === operator.value),
)

function selectColumn(id: string) {
  const nextMeta = props.table.getColumn(id)?.columnDef.meta
  const nextOperators = nextMeta?.filterVariant
    ? operatorRegistry[nextMeta.filterVariant]
    : []
  columnId.value = id
  operator.value = nextOperators[0]?.value
  value.value = undefined
}

function apply() {
  if (columnId.value && activeOperator.value) {
    emit('apply', columnId.value, activeOperator.value.value, value.value)
  }
}
</script>

<template>
  <!-- Step 1: no column locked and none picked yet — choose which column to filter. -->
  <Command v-if="!props.columnId && !columnId">
    <CommandInput placeholder="Filter by..." />
    <CommandList>
      <CommandEmpty>No more columns to filter.</CommandEmpty>
      <CommandGroup>
        <CommandItem
          v-for="id in availableColumnIds"
          :key="id"
          :value="table.getColumn(id)?.columnDef.meta?.label ?? id"
          @select="selectColumn(id)"
        >
          {{ table.getColumn(id)?.columnDef.meta?.label }}
        </CommandItem>
      </CommandGroup>
    </CommandList>
  </Command>

  <!-- Step 2: column is set — choose operator, then the matching value input. -->
  <div v-else-if="columnId && meta?.filterVariant" class="space-y-3 p-3">
    <p class="text-sm font-medium text-foreground">{{ meta.label }}</p>

    <Select v-model="operator">
      <SelectTrigger class="w-full">
        <SelectValue placeholder="Operator" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem v-for="op in operators" :key="op.value" :value="op.value">
            {{ op.label }}
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>

    <FilterValueInput
      v-if="activeOperator"
      v-model:value="value"
      :label="meta.label"
      :variant="meta.filterVariant"
      :operator="activeOperator"
      :options="meta.filterOptions"
    />

    <div class="flex items-center justify-between pt-1">
      <Button
        v-if="removable"
        type="button"
        variant="ghost"
        size="sm"
        @click="emit('remove')"
      >
        Remove
      </Button>
      <span v-else />
      <Button
        type="button"
        size="sm"
        :disabled="!activeOperator || !isValueValid(activeOperator, value)"
        @click="apply"
      >
        Apply
      </Button>
    </div>
  </div>
</template>
