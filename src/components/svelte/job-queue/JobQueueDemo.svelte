<script lang="ts">
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw'
  import { Button } from '$lib/components/ui/button/index.js'
  import { seedJobs } from './data'
  import type { Job } from './data'
  import JobQueueTable from './JobQueueTable.svelte'
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
  let now = $state(0)
  // Replaced, never mutated, so raw state is enough
  let jobs = $state.raw<Job[]>(seedJobs())
  let view = $state<View>('all')

  function reset() {
    now = 0
    jobs = seedJobs()
  }

  const busy = $derived(jobs.some((j) => isActive(j.status)))

  // The clock only runs while something is queued, running or retrying
  $effect(() => {
    if (!busy) return
    const timer = setInterval(() => {
      now += TICK
      jobs = tick(jobs, now, TICK)
    }, TICK)
    return () => clearInterval(timer)
  })

  const count = (v: View) => jobs.filter((j) => inView(j.status, v)).length
  const running = $derived(jobs.filter((j) => j.status === 'running').length)
  const waiting = $derived(
    jobs.filter((j) => j.status === 'queued' || j.status === 'retrying').length,
  )
  const failed = $derived(jobs.filter((j) => j.status === 'failed'))

  const meta = $derived({
    now,
    retry: (id: string) => (jobs = retry(jobs, [id], now)),
    cancel: (id: string) => (jobs = cancel(jobs, id, now)),
  })
</script>

<div class="space-y-3">
  <div class="flex flex-wrap items-center justify-between gap-2">
    <p class="text-sm text-muted-foreground">
      <span class="font-medium text-foreground">
        {running} of {CONCURRENCY} workers busy
      </span>
      · {waiting} waiting · {failed.length} failed
    </p>
    <div class="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={!failed.length}
        onclick={() =>
          (jobs = retry(
            jobs,
            failed.map((j) => j.id),
            now,
          ))}
      >
        <RotateCcw /> Retry all failed
      </Button>
      <Button variant="ghost" size="sm" onclick={reset}>Reset demo</Button>
    </div>
  </div>

  <div
    role="group"
    aria-label="Show jobs"
    class="inline-flex rounded-md border p-0.5"
  >
    {#each views as v (v.id)}
      <button
        type="button"
        aria-pressed={view === v.id}
        onclick={() => (view = v.id)}
        class="flex h-7 items-center gap-1.5 rounded px-2.5 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:bg-muted aria-pressed:text-foreground"
      >
        {v.label}
        <span class="text-xs tabular-nums">{count(v.id)}</span>
      </button>
    {/each}
  </div>

  <JobQueueTable {jobs} {view} {meta} />
</div>
