<script lang="ts">
  import Bell from '@lucide/svelte/icons/bell'
  import Plus from '@lucide/svelte/icons/plus'
  import { Button } from '$lib/components/ui/button/index.js'
  import { cn } from '$lib/utils.js'

  let { name }: { name: string } = $props()

  let added = $state(false)
  let watching = $state(false)
</script>

<div class="flex items-center justify-end gap-1.5">
  <Button
    type="button"
    variant="outline"
    size="icon"
    aria-pressed={added}
    aria-label="{added ? 'Remove' : 'Add'} {name} {added ? 'from' : 'to'} the purchase order"
    class={cn(
      'size-7 rounded-full text-amber-600 hover:text-amber-600 dark:text-amber-400',
      added && 'border-amber-500 bg-amber-500/10',
    )}
    onclick={() => (added = !added)}
  >
    <Plus class={cn('size-4 transition-transform', added && 'rotate-45')} />
  </Button>
  <Button
    type="button"
    variant="ghost"
    size="icon"
    aria-pressed={watching}
    aria-label="{watching ? 'Stop watching' : 'Watch'} stock of {name}"
    class="size-7 text-amber-600 hover:text-amber-600 dark:text-amber-400"
    onclick={() => (watching = !watching)}
  >
    <Bell class={cn('size-4', watching && 'fill-current')} />
  </Button>
</div>
