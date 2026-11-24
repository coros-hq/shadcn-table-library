<script lang="ts">
  import ChevronRight from '@lucide/svelte/icons/chevron-right'
  import { cn } from '$lib/utils.js'

  let { expanded, ontoggle }: { expanded: boolean; ontoggle: () => void } = $props()
</script>

<button
  type="button"
  onclick={ontoggle}
  aria-label={expanded ? 'Hide batches' : 'Show batches'}
  aria-expanded={expanded}
  class="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
>
  <ChevronRight class={cn('size-3.5 transition-transform', expanded && 'rotate-90')} />
</button>
