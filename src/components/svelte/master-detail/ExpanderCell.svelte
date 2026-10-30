<script lang="ts">
  import ChevronRight from '@lucide/svelte/icons/chevron-right'
  import { cn } from '$lib/utils.js'

  let { expanded, ontoggle }: { expanded: boolean; ontoggle: () => void } = $props()
</script>

<button
  type="button"
  onclick={ontoggle}
  class="flex h-4 w-4 items-center justify-center text-muted-foreground"
  aria-label={expanded ? 'Collapse row' : 'Expand row'}
  aria-expanded={expanded}
>
  <ChevronRight class={cn('h-3.5 w-3.5 transition-transform', expanded && 'rotate-90')} />
</button>
