<script lang="ts">
  import type { Job } from './data'

  let { job }: { job: Job } = $props()
</script>

<div class="flex min-w-40 flex-col gap-0.5">
  <span class="font-medium">{job.name}</span>
  <span class="font-mono text-xs text-muted-foreground">
    {job.queue} · {job.id}
  </span>
</div>
