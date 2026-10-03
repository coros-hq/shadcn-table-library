<script setup lang="ts" generic="TData">
import { ref } from 'vue'
import { Plus } from '@lucide/vue'
import type { Table } from '@tanstack/vue-table'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import FilterConditionEditor from './FilterConditionEditor.vue'

const props = defineProps<{
  table: Table<TData>
  availableColumnIds: string[]
}>()

const open = ref(false)

function apply(columnId: string, operator: string, value: unknown) {
  props.table.getColumn(columnId)?.setFilterValue({ operator, value })
  open.value = false
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button type="button" variant="outline" size="sm">
        <Plus class="h-4 w-4" />
        Add filter
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-64 p-0" align="start">
      <FilterConditionEditor
        :table="table"
        :available-column-ids="availableColumnIds"
        @apply="apply"
      />
    </PopoverContent>
  </Popover>
</template>
