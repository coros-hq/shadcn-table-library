<script setup lang="ts">
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { Summary } from './permissions'

defineProps<{ summary: Summary; label: string }>()
const emit = defineEmits<{ change: [on: boolean] }>()

const muted =
  'disabled:opacity-100 data-[state=checked]:border-transparent data-[state=checked]:bg-muted-foreground/25 data-[state=checked]:text-foreground data-[state=indeterminate]:border-transparent data-[state=indeterminate]:bg-muted-foreground/25 data-[state=indeterminate]:text-foreground'
</script>

<template>
  <Checkbox
    :model-value="summary.checked"
    :disabled="!summary.enabled"
    :aria-label="label"
    :class="cn(!summary.enabled && muted)"
    @update:model-value="emit('change', summary.next)"
  />
</template>
