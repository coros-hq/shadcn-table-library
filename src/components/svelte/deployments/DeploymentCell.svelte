<script lang="ts">
  import { currentProductionId } from './data'
  import type { Deployment } from './data'

  let { deployment: d }: { deployment: Deployment } = $props()
</script>

<div class="space-y-1">
  <p class="font-mono text-xs">{d.id.slice(0, 13)}</p>
  <p class="flex items-center gap-1.5 text-xs text-muted-foreground">
    {d.environment}
    {#if d.id === currentProductionId}
      <span class="rounded-sm bg-sky-500/15 px-1 text-[11px] text-sky-700 dark:text-sky-300">
        Current
      </span>
    {/if}
  </p>
</div>
