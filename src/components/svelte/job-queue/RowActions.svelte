<script lang="ts">
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw'
  import X from '@lucide/svelte/icons/x'
  import { Button } from '$lib/components/ui/button/index.js'
  import type { Job } from './data'
  import { isActive } from './queue'

  type Props = {
    job: Job
    onretry: () => void
    oncancel: () => void
  }

  let { job, onretry, oncancel }: Props = $props()
</script>

{#if job.status === 'failed' || job.status === 'canceled'}
  <div class="flex justify-end">
    <Button
      variant="outline"
      size="sm"
      aria-label="Retry {job.name}"
      onclick={onretry}
    >
      <RotateCcw /> Retry
    </Button>
  </div>
{:else if isActive(job.status)}
  <div class="flex justify-end">
    <Button
      variant="ghost"
      size="sm"
      aria-label="Cancel {job.name}"
      onclick={oncancel}
    >
      <X /> Cancel
    </Button>
  </div>
{/if}
