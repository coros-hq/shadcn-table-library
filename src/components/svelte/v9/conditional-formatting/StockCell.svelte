<script lang="ts">
  import AlertTriangle from '@lucide/svelte/icons/triangle-alert'
  import { cn } from '$lib/utils.js'

  let {
    stock,
    reorderPoint,
    className,
  }: { stock: number; reorderPoint: number; className?: string } = $props()
</script>

<div
  class={cn('flex items-center gap-1.5 rounded px-2 py-1 tabular-nums', className)}
>
  {#if className}
    <AlertTriangle class="h-3.5 w-3.5 shrink-0" />
  {/if}
  <span>{stock}</span>
  <span class="text-xs text-muted-foreground">/ {reorderPoint} reorder pt.</span>
</div>
