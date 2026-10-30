<script lang="ts">
  import { cn } from '$lib/utils.js'

  type Props = {
    allocated: number
    orderedQty: number
    unallocated: number
  }

  let { allocated, orderedQty, unallocated }: Props = $props()

  const pct = $derived(orderedQty ? Math.min(100, (allocated / orderedQty) * 100) : 100)
</script>

<div class="w-32 space-y-1.5 tabular-nums">
  <p class="text-xs">
    {allocated.toLocaleString()} / {orderedQty.toLocaleString()}
    {#if unallocated > 0}
      <span class="text-muted-foreground"> · {unallocated} open</span>
    {/if}
  </p>
  <div class="h-1.5 overflow-hidden rounded-full bg-muted">
    <div
      class={cn('h-full rounded-full', unallocated > 0 ? 'bg-amber-500' : 'bg-emerald-500')}
      style:width="{pct}%"
    ></div>
  </div>
</div>
