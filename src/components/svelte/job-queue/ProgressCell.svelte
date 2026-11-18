<script lang="ts">
  import { cn } from '$lib/utils.js'
  import type { Job } from './data'
  import { statusStyle } from './status'

  let { job }: { job: Job } = $props()

  const pct = $derived(Math.floor((job.done / job.total) * 100))
</script>

<div class="flex min-w-40 flex-col gap-1">
  <div
    role="progressbar"
    aria-label="{job.name} progress"
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={pct}
    class="h-1.5 overflow-hidden rounded-full bg-muted"
  >
    <div
      class={cn(
        'h-full rounded-full transition-[width] duration-200 ease-linear motion-reduce:transition-none',
        statusStyle[job.status].bar,
      )}
      style="width: {pct}%"
    ></div>
  </div>
  <span class="text-xs text-muted-foreground tabular-nums">
    {job.status === 'queued'
      ? `Waiting · ${job.total.toLocaleString('en-US')} items`
      : `${pct}% · ${Math.round(job.done).toLocaleString('en-US')} / ${job.total.toLocaleString('en-US')}`}
  </span>
</div>
