<script lang="ts">
  import { day } from './columns'
  import type { TreeRow } from './data'

  let { item }: { item: TreeRow } = $props()
</script>

<span class="whitespace-nowrap text-muted-foreground">
  {item.kind === 'order'
    ? day.format(new Date(item.placedAt))
    : `ETA ${day.format(new Date(item.eta))}`}
</span>
