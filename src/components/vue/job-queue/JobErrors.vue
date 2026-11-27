<script setup lang="ts">
import { computed } from 'vue'
import { CircleAlert, CircleCheck, LoaderCircle } from '@lucide/vue'
import type { Attempt, Job } from './data'
import { formatDuration, isActive } from './queue'

/**
 * The expanded row: every attempt, newest first. Failed attempts show their
 * error code, message and stack trace, so a retry can be judged on what
 * actually went wrong.
 */
const props = defineProps<{ job: Job }>()

const attempts = computed(() => [...props.job.attempts].reverse())

const running = (a: Attempt) => !a.endedAt && isActive(props.job.status)

function summary(a: Attempt) {
  if (running(a)) return 'running now'
  const took =
    a.endedAt !== undefined ? formatDuration(a.endedAt - a.startedAt) : ''
  if (a.error) {
    return `failed after ${took} at ${a.processed?.toLocaleString('en-US')} of ${props.job.total.toLocaleString('en-US')} items`
  }
  return a.canceled ? `canceled after ${took}` : `succeeded in ${took}`
}

const trace = (lines: string[]) =>
  lines.map((line, i) => (i === 0 ? line : `    ${line}`)).join('\n')
</script>

<template>
  <ol class="space-y-3">
    <li v-for="a in attempts" :key="a.number" class="space-y-1.5">
      <p class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <CircleAlert v-if="a.error" class="size-4 text-destructive" />
        <LoaderCircle
          v-else-if="running(a)"
          class="size-4 text-sky-600 motion-safe:animate-spin dark:text-sky-400"
        />
        <CircleCheck v-else class="size-4 text-muted-foreground" />
        <span class="font-medium">Attempt {{ a.number }}</span>
        <span class="text-muted-foreground">{{ summary(a) }}</span>
      </p>
      <div
        v-if="a.error"
        class="ml-6 overflow-hidden rounded-md border border-destructive/20"
      >
        <p class="flex flex-wrap gap-x-2 bg-destructive/5 px-3 py-2 text-sm">
          <code class="font-mono text-xs font-medium text-destructive">
            {{ a.error.code }}
          </code>
          <span>{{ a.error.message }}</span>
        </p>
        <pre
          class="overflow-x-auto px-3 py-2 font-mono text-xs leading-relaxed text-muted-foreground"
          >{{ trace(a.error.trace) }}</pre>
      </div>
    </li>
  </ol>
</template>
