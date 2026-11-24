<script lang="ts">
  import ChevronRight from '@lucide/svelte/icons/chevron-right'
  import { cn } from '$lib/utils.js'

  type Props = {
    name: string
    depth: number
    canExpand: boolean
    expanded: boolean
    onToggle: () => void
  }

  let { name, depth, canExpand, expanded, onToggle }: Props = $props()
</script>

<div class="flex items-center gap-1.5" style="padding-left: {depth * 1.25}rem">
  {#if canExpand}
    <button
      type="button"
      onclick={onToggle}
      class="flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground"
      aria-label={expanded ? 'Collapse row' : 'Expand row'}
    >
      <ChevronRight
        class={cn('h-3.5 w-3.5 transition-transform', expanded && 'rotate-90')}
      />
    </button>
  {:else}
    <span class="w-4 shrink-0"></span>
  {/if}
  {name}
</div>
