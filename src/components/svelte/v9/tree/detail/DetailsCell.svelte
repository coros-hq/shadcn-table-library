<script lang="ts">
  import type { TreeRow } from './data'

  let { item }: { item: TreeRow } = $props()
</script>

{#if item.kind === 'order'}
  <div>
    <div>{item.customer}</div>
    <div class="text-xs text-muted-foreground">{item.email}</div>
  </div>
{:else}
  <span class="text-muted-foreground">{item.destination}</span>
{/if}
