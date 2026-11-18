<script setup lang="ts">
import { cn } from '@/lib/utils'
import { shiftById } from './data'
import type { ShiftId } from './data'
import { shiftTone } from './tone'

/** A shift's letter in its color, as in the cells and the legend */
const props = defineProps<{ shift: ShiftId; class?: string }>()
</script>

<template>
  <span
    aria-hidden="true"
    :class="
      cn(
        'inline-flex size-5 shrink-0 items-center justify-center rounded text-[11px] font-semibold',
        shiftTone[props.shift],
        props.class,
      )
    "
  >
    {{ shiftById[props.shift].code }}
  </span>
</template>
