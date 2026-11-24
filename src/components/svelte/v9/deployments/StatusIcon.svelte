<script lang="ts">
  import { cn } from '$lib/utils.js'
  import type { DeploymentStatus } from './data'

  /**
   * Status marker, shared by the table and the Status filter menu. Queued gets
   * a spinning ring instead of a dot, so "waiting for a builder" reads as
   * activity rather than as a dead grey state.
   */
  let { status }: { status: DeploymentStatus } = $props()

  const statusDot: Record<Exclude<DeploymentStatus, 'Queued'>, string> = {
    Ready: 'bg-emerald-500',
    Building: 'bg-amber-500 motion-safe:animate-pulse',
    Error: 'bg-red-500',
    Canceled: 'bg-muted-foreground/30',
  }
</script>

{#if status === 'Queued'}
  <span
    aria-hidden="true"
    class="size-2.5 shrink-0 rounded-full border-[1.5px] border-muted-foreground/30 border-t-muted-foreground motion-safe:animate-spin"
  ></span>
{:else}
  <!-- Same 10px box as the ring, so labels line up whatever the status -->
  <span
    aria-hidden="true"
    class="flex size-2.5 shrink-0 items-center justify-center"
  >
    <span class={cn('size-2 rounded-full', statusDot[status])}></span>
  </span>
{/if}
