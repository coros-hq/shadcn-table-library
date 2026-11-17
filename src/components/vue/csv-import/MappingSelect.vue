<script setup lang="ts">
import { computed } from 'vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { fields } from './schema'
import type { FieldId } from './schema'
import type { Mapping } from './review'

const SKIP = '__skip'

/** A column header: the CSV's own name, and the field it is imported into */
const props = defineProps<{
  header: string
  column: number
  mapping: Mapping
}>()
const emit = defineEmits<{ change: [field: FieldId | null] }>()

const value = computed(() => props.mapping[props.column])
const usedElsewhere = (id: FieldId) =>
  props.mapping.some((f, i) => f === id && i !== props.column)
</script>

<template>
  <div class="flex min-w-36 flex-col gap-1 py-2">
    <span
      :class="
        cn(
          'truncate text-xs font-normal',
          value ? 'text-muted-foreground' : 'text-muted-foreground/70',
        )
      "
      :title="header"
    >
      {{ header }}
    </span>
    <Select
      :model-value="value ?? SKIP"
      @update:model-value="
        (v) => emit('change', v === SKIP ? null : (v as FieldId))
      "
    >
      <SelectTrigger
        size="sm"
        :aria-label="`Import column &quot;${header}&quot; as`"
        :class="
          cn(
            'w-full bg-background font-medium',
            !value && 'border-dashed font-normal text-muted-foreground',
          )
        "
      >
        <!-- Explicit text, so the hints inside the items stay out of the trigger -->
        {{ value ? fields.find((f) => f.id === value)?.label : "Don't import" }}
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="field in fields" :key="field.id" :value="field.id">
          {{ field.label }}
          <span v-if="field.required" class="text-muted-foreground">
            required
          </span>
          <span v-if="usedElsewhere(field.id)" class="text-muted-foreground">
            · moves here
          </span>
        </SelectItem>
        <SelectSeparator />
        <SelectItem :value="SKIP">Don't import</SelectItem>
      </SelectContent>
    </Select>
  </div>
</template>
