<script lang="ts">
  import { money } from './columns'
  import type { TreeRow } from './data'

  let { item }: { item: TreeRow } = $props()
</script>

<div class="text-right tabular-nums">
  {#if item.kind === 'order'}
    {money.format(item.total)}
  {:else}
    <span class="text-muted-foreground">
      {item.items} {item.items === 1 ? 'item' : 'items'}
    </span>
  {/if}
</div>
