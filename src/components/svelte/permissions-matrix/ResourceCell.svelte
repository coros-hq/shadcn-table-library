<script lang="ts">
  import ChevronRight from '@lucide/svelte/icons/chevron-right'
  import { cn } from '$lib/utils.js'

  type Props = {
    name: string
    description?: string
    /** Group rows expand; resource rows show their description instead */
    count?: number
    expanded: boolean
    onToggle?: () => void
  }

  let { name, description, count, expanded, onToggle }: Props = $props()
</script>

{#if onToggle}
  <button
    type="button"
    onclick={onToggle}
    aria-expanded={expanded}
    class="flex items-center gap-1.5 rounded-sm text-left font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
  >
    <ChevronRight
      class={cn(
        'size-4 text-muted-foreground transition-transform',
        expanded && 'rotate-90',
      )}
    />
    {name}
    <span class="font-normal text-muted-foreground">{count}</span>
  </button>
{:else}
  <div class="flex min-w-0 flex-col pl-5.5">
    <span class="truncate">{name}</span>
    <span class="truncate text-xs text-muted-foreground">{description}</span>
  </div>
{/if}
