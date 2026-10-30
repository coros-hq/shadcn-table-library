<script lang="ts">
  let { latencyMs, isDown }: { latencyMs: number; isDown: boolean } = $props()
</script>

{#if isDown}
  <span class="text-muted-foreground">—</span>
{:else}
  <span class="tabular-nums">{latencyMs}ms</span>
{/if}
