<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import { formatDuration } from './data'
import type { LogEntry } from './data'

/** Every field of an event, including ones that are not table columns */
const props = withDefaults(
  defineProps<{
    log: LogEntry
    /** Labels to leave out, when the surrounding layout already shows them */
    omit?: string[]
    class?: string
  }>(),
  { omit: () => [] },
)

const fields = computed<[string, string][]>(() => {
  const log = props.log
  const all: [string, string][] = [
    ['Timestamp', new Date(log.timestamp).toISOString()],
    ['Request ID', log.requestId],
    ['Level', log.level],
    ['Service', log.service],
    ['Region', log.region],
    ['Method', log.method],
    ['Path', log.path],
    ['Status', String(log.status)],
    ['Duration', formatDuration(log.durationMs)],
    ['Message', log.message],
  ]
  return all.filter(([label]) => !props.omit.includes(label))
})
</script>

<template>
  <dl
    :class="
      cn(
        'grid grid-cols-[max-content_1fr] gap-x-6 gap-y-1.5 text-sm whitespace-normal',
        props.class,
      )
    "
  >
    <template v-for="[label, value] in fields" :key="label">
      <dt class="text-muted-foreground">{{ label }}</dt>
      <dd class="break-all">{{ value }}</dd>
    </template>
  </dl>
</template>
