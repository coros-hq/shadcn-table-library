<script lang="ts">
  import { Badge } from '$lib/components/ui/badge/index.js'
  import { cn } from '$lib/utils.js'
  import type { Job } from './data'
  import { formatDuration } from './queue'
  import { statusStyle } from './status'

  let { job, now }: { job: Job; now: number } = $props()

  const style = $derived(statusStyle[job.status])
  const wait = $derived(
    job.status === 'retrying' && job.retryAt !== undefined
      ? formatDuration(job.retryAt - now + 999)
      : null,
  )
</script>

<Badge variant="outline" class={cn('gap-1', style.badge)}>
  <style.icon
    class={cn('size-3', job.status === 'running' && 'motion-safe:animate-spin')}
  />
  {style.label}
  {#if wait}<span class="tabular-nums">in {wait}</span>{/if}
</Badge>
