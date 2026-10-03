<script setup lang="ts" generic="T extends string">
import { useId } from 'vue'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    label: string
    options: readonly T[]
    getLabel?: (value: T) => string
  }>(),
  { getLabel: (value: string) => value },
)

const selected = defineModel<T[]>('selected', { required: true })

const id = useId()

function toggle(value: T) {
  selected.value = selected.value.includes(value)
    ? selected.value.filter((item) => item !== value)
    : [...selected.value, value]
}
</script>

<template>
  <fieldset class="space-y-2">
    <legend class="text-sm font-medium">{{ label }}</legend>
    <div class="flex flex-wrap gap-2">
      <Label
        v-for="option in props.options"
        :key="option"
        :for="`${id}-${option}`"
        :class="
          cn(
            'flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm font-normal transition-colors',
            selected.includes(option)
              ? 'border-foreground/25 bg-muted/60'
              : 'text-muted-foreground',
          )
        "
      >
        <Checkbox
          :id="`${id}-${option}`"
          :model-value="selected.includes(option)"
          @update:model-value="toggle(option)"
        />
        {{ props.getLabel(option) }}
      </Label>
    </div>
  </fieldset>
</template>
