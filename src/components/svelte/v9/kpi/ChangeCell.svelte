<script lang="ts">
  import Minus from '@lucide/svelte/icons/minus'
  import TrendingDown from '@lucide/svelte/icons/trending-down'
  import TrendingUp from '@lucide/svelte/icons/trending-up'
  import { cn } from '$lib/utils.js'

  let { change }: { change: number } = $props()

  const isFlat = $derived(change === 0)
  const isUp = $derived(change > 0)
  const Icon = $derived(isFlat ? Minus : isUp ? TrendingUp : TrendingDown)
</script>

<span
  class={cn(
    'inline-flex items-center gap-1 text-sm font-medium',
    isFlat
      ? 'text-muted-foreground'
      : isUp
        ? 'text-emerald-600 dark:text-emerald-500'
        : 'text-rose-600 dark:text-rose-500',
  )}
>
  <Icon class="h-3.5 w-3.5" />
  {isUp ? '+' : ''}{change.toFixed(1)}%
</span>
