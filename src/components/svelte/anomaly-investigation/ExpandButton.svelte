<script lang="ts">
  import ChevronRight from '@lucide/svelte/icons/chevron-right'
  import { Button } from '$lib/components/ui/button/index.js'
  import { cn } from '$lib/utils.js'

  let {
    name,
    expanded,
    ontoggle,
  }: { name: string; expanded: boolean; ontoggle: () => void } = $props()
</script>

<Button
  variant="ghost"
  size="icon"
  class="size-7"
  aria-expanded={expanded}
  aria-label="{expanded ? 'Hide' : 'Show'} history for {name}"
  onclick={ontoggle}
>
  <ChevronRight
    class={cn(
      'transition-transform motion-reduce:transition-none',
      expanded && 'rotate-90',
    )}
  />
</Button>
