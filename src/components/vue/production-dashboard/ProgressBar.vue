<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  /** 0–100. Values above 100 (over-target output) are clamped for display. */
  value: number
  class?: string
  barClassName?: string
}>()

const clamped = computed(() => Math.min(100, Math.max(0, props.value)))
</script>

<template>
  <div
    role="progressbar"
    :aria-valuenow="Math.round(value)"
    aria-valuemin="0"
    aria-valuemax="100"
    :class="cn('h-1.5 w-full overflow-hidden rounded-full bg-muted', props.class)"
  >
    <div
      :class="cn('h-full rounded-full bg-foreground', barClassName)"
      :style="{ width: `${clamped}%` }"
    />
  </div>
</template>
