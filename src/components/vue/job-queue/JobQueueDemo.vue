<script setup lang="ts">
import { computed, onUnmounted, ref, shallowRef, watch } from 'vue'
import { RotateCcw } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { seedJobs } from './data'
import type { Job } from './data'
import JobQueueTable from './JobQueueTable.vue'
import { CONCURRENCY, cancel, inView, isActive, retry, tick } from './queue'
import type { View } from './queue'

const TICK = 200

const views: { id: View; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'failed', label: 'Failed' },
  { id: 'done', label: 'Done' },
]

// Demo clock in ms. It starts at 0 on the server and in the browser alike,
// so both render the same durations.
const now = ref(0)
// Replaced, never mutated, so a shallow ref is enough
const jobs = shallowRef<Job[]>(seedJobs())
const view = ref<View>('all')

function reset() {
  now.value = 0
  jobs.value = seedJobs()
}

const busy = computed(() => jobs.value.some((j) => isActive(j.status)))

// The clock only runs while something is queued, running or retrying
let timer: ReturnType<typeof setInterval> | undefined
watch(
  busy,
  (active) => {
    clearInterval(timer)
    timer = undefined
    if (!active || typeof window === 'undefined') return
    timer = setInterval(() => {
      now.value += TICK
      jobs.value = tick(jobs.value, now.value, TICK)
    }, TICK)
  },
  { immediate: true },
)
onUnmounted(() => clearInterval(timer))

const count = (v: View) => jobs.value.filter((j) => inView(j.status, v)).length
const running = computed(
  () => jobs.value.filter((j) => j.status === 'running').length,
)
const waiting = computed(
  () =>
    jobs.value.filter((j) => j.status === 'queued' || j.status === 'retrying')
      .length,
)
const failed = computed(() => jobs.value.filter((j) => j.status === 'failed'))

const meta = computed(() => ({
  now: now.value,
  retry: (id: string) => (jobs.value = retry(jobs.value, [id], now.value)),
  cancel: (id: string) => (jobs.value = cancel(jobs.value, id, now.value)),
}))

function retryFailed() {
  jobs.value = retry(
    jobs.value,
    failed.value.map((j) => j.id),
    now.value,
  )
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <p class="text-sm text-muted-foreground">
        <span class="font-medium text-foreground">
          {{ running }} of {{ CONCURRENCY }} workers busy
        </span>
        · {{ waiting }} waiting · {{ failed.length }} failed
      </p>
      <div class="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="!failed.length"
          @click="retryFailed"
        >
          <RotateCcw /> Retry all failed
        </Button>
        <Button variant="ghost" size="sm" @click="reset">Reset demo</Button>
      </div>
    </div>

    <div
      role="group"
      aria-label="Show jobs"
      class="inline-flex rounded-md border p-0.5"
    >
      <button
        v-for="v in views"
        :key="v.id"
        type="button"
        :aria-pressed="view === v.id"
        class="flex h-7 items-center gap-1.5 rounded px-2.5 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:bg-muted aria-pressed:text-foreground"
        @click="view = v.id"
      >
        {{ v.label }}
        <span class="text-xs tabular-nums">{{ count(v.id) }}</span>
      </button>
    </div>

    <JobQueueTable :jobs="jobs" :view="view" :meta="meta" />
  </div>
</template>
