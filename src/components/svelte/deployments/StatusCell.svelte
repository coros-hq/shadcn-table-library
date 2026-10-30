<script lang="ts">
  import StatusIcon from './StatusIcon.svelte'
  import { formatDuration } from './data'
  import type { DeploymentStatus } from './data'

  let {
    status,
    durationSec,
  }: { status: DeploymentStatus; durationSec: number | null } = $props()
</script>

<div class="space-y-1">
  <p class="flex items-center gap-2">
    <StatusIcon {status} />
    {status}
  </p>
  {#if durationSec === null}
    <!-- Stand-in for the build time while a deployment waits in the queue -->
    <span class="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span class="sr-only">Waiting for a build slot</span>
      <span aria-hidden="true" class="flex items-center gap-0.5">
        {#each [0, 150, 300] as delay (delay)}
          <span
            class="size-1 rounded-full bg-muted-foreground/60 motion-safe:animate-pulse"
            style="animation-delay: {delay}ms"
          ></span>
        {/each}
      </span>
      <span aria-hidden="true">waiting</span>
    </span>
  {:else}
    <p class="font-mono text-xs text-muted-foreground">
      {formatDuration(durationSec)}
    </p>
  {/if}
</div>
