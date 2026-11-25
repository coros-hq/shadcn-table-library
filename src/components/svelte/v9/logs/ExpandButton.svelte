<script lang="ts">
  import ChevronRight from '@lucide/svelte/icons/chevron-right'
  import { cn } from '$lib/utils.js'

  let { expanded, ontoggle }: { expanded: boolean; ontoggle: () => void } = $props()
</script>

<button
  type="button"
  aria-label={expanded ? 'Hide details' : 'Show details'}
  aria-expanded={expanded}
  onclick={(e) => {
    // The row itself also toggles on click; don't toggle twice
    e.stopPropagation()
    ontoggle()
  }}
  class="flex size-5 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
>
  <ChevronRight class={cn('size-3.5 transition-transform', expanded && 'rotate-90')} />
</button>
