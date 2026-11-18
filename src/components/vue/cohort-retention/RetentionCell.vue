<script setup lang="ts">
import { cn } from '@/lib/utils'
import { formatCount, formatPercent, needsLightText } from './cohorts'
import type { Cell, Mode } from './cohorts'
import { fill, hatch } from './styles'

/**
 * One retention cell. A month the cohort hasn't reached is hatched and says
 * so; a real zero is a plain cell that shows 0.
 */
withDefaults(
  defineProps<{
    cell: Cell
    mode: Mode
    title: string
    /** What an unavailable cell means here */
    unavailable?: string
  }>(),
  { unavailable: 'Not reached yet' },
)
</script>

<template>
  <span
    v-if="cell.kind === 'unavailable'"
    :title="`${title}: ${unavailable.toLowerCase()}`"
    :class="
      cn(
        'flex h-9 items-center justify-center rounded-sm text-xs text-muted-foreground/70',
        hatch,
      )
    "
  >
    <span aria-hidden="true">–</span>
    <span class="sr-only">{{ unavailable }}</span>
  </span>
  <span
    v-else
    :title="`${title}: ${formatCount(cell.count)} users, ${formatPercent(cell.percent)}`"
    :style="fill(cell.percent)"
    :class="
      cn(
        'flex h-9 items-center justify-center rounded-sm text-xs tabular-nums',
        needsLightText(cell.percent) && 'font-medium text-white',
        // A hairline makes an empty-looking zero read as a value
        cell.count === 0 &&
          'text-muted-foreground shadow-[inset_0_0_0_1px_var(--border)]',
      )
    "
  >
    {{
      mode === 'percent' ? formatPercent(cell.percent) : formatCount(cell.count)
    }}
  </span>
</template>
