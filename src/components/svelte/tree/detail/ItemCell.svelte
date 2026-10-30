<script lang="ts">
  import ChevronRight from '@lucide/svelte/icons/chevron-right'
  import { cn } from '$lib/utils.js'
  import type { TreeRow } from './data'

  type Props = {
    item: TreeRow
    depth: number
    canExpand: boolean
    expanded: boolean
    onToggle: () => void
  }

  let { item, depth, canExpand, expanded, onToggle }: Props = $props()
</script>

<div class="flex items-center gap-1.5" style="padding-left: {depth * 1.5}rem">
  {#if canExpand}
    <button
      type="button"
      onclick={onToggle}
      class="flex size-4 shrink-0 items-center justify-center text-muted-foreground"
      aria-label="{expanded ? 'Collapse' : 'Expand'} order"
    >
      <ChevronRight class={cn('size-3.5 transition-transform', expanded && 'rotate-90')} />
    </button>
  {:else}
    <span class="w-4 shrink-0"></span>
  {/if}
  {#if item.kind === 'order'}
    <span class="font-medium">Order {item.number}</span>
  {:else}
    <span>
      {item.carrier}
      <span class="font-mono text-xs text-muted-foreground">{item.tracking.slice(0, 10)}…</span>
    </span>
  {/if}
</div>
