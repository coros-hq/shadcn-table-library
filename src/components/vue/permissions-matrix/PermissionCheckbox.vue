<script setup lang="ts">
import { computed } from 'vue'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { describe } from './permissions'
import type { CellState } from './permissions'

const props = defineProps<{
  state: CellState
  /** e.g. "Edit Invoices" */
  label: string
  /** Differs from the last save */
  changed: boolean
}>()

const emit = defineEmits<{ change: [on: boolean] }>()

// Inherited and locked grants read as "on, but not yours to change"
const muted =
  'disabled:opacity-100 data-[state=checked]:border-transparent data-[state=checked]:bg-muted-foreground/25 data-[state=checked]:text-foreground dark:data-[state=checked]:bg-muted-foreground/30'

const editable = computed(
  () => props.state.kind === 'granted' || props.state.kind === 'denied',
)
const reason = computed(() => describe(props.state))
</script>

<template>
  <span
    v-if="state.kind === 'unavailable'"
    class="text-muted-foreground/50"
    :title="reason"
  >
    <span aria-hidden="true">–</span>
    <span class="sr-only">{{ label }}: {{ reason }}</span>
  </span>
  <span v-else class="relative inline-flex">
    <Checkbox
      v-if="editable"
      :model-value="state.kind !== 'denied'"
      :aria-label="label"
      @update:model-value="(v) => emit('change', v === true)"
    />
    <!-- A disabled button gets no pointer events, so the tooltip hangs on a wrapper -->
    <Tooltip v-else>
      <TooltipTrigger as-child>
        <span class="inline-flex">
          <Checkbox
            :model-value="true"
            disabled
            :aria-label="`${label}: ${reason}`"
            :class="
              cn(
                (state.kind === 'inherited' || state.kind === 'locked') &&
                  muted,
              )
            "
          />
        </span>
      </TooltipTrigger>
      <TooltipContent>{{ reason }}</TooltipContent>
    </Tooltip>
    <span
      v-if="changed"
      aria-hidden="true"
      class="absolute -top-1 -right-1 size-1.5 rounded-full bg-amber-500"
    />
  </span>
</template>
