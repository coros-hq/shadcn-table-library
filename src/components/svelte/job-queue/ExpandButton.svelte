<script lang="ts">
  import ChevronRight from '@lucide/svelte/icons/chevron-right'
  import { Button } from '$lib/components/ui/button/index.js'
  import { cn } from '$lib/utils.js'

  type Props = { name: string; expanded: boolean; ontoggle: () => void }

  let { name, expanded, ontoggle }: Props = $props()
</script>

<Button
  variant="ghost"
  size="icon"
  class="size-7"
  onclick={ontoggle}
  aria-expanded={expanded}
  aria-label="{expanded ? 'Hide' : 'Show'} errors for {name}"
>
  <ChevronRight
    class={cn(
      'transition-transform motion-reduce:transition-none',
      expanded && 'rotate-90',
    )}
  />
</Button>
