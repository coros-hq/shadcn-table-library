<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import type { ServiceStatus } from './columns'

const STATUS_CONFIG: Record<
  ServiceStatus,
  { label: string; dot: string; pulse: boolean }
> = {
  operational: { label: 'Operational', dot: 'bg-emerald-500', pulse: true },
  degraded: { label: 'Degraded', dot: 'bg-amber-500', pulse: true },
  down: { label: 'Down', dot: 'bg-red-500', pulse: false },
}

const props = defineProps<{ status: ServiceStatus }>()
const config = computed(() => STATUS_CONFIG[props.status])
</script>

<template>
  <span class="inline-flex items-center gap-2 text-sm">
    <span class="relative flex size-2.5">
      <span
        v-if="config.pulse"
        :class="
          cn(
            'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
            config.dot,
          )
        "
      />
      <span
        :class="cn('relative inline-flex size-2.5 rounded-full', config.dot)"
      />
    </span>
    {{ config.label }}
  </span>
</template>
