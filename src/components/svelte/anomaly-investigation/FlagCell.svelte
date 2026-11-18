<script lang="ts">
  import ArrowDown from '@lucide/svelte/icons/arrow-down'
  import ArrowUp from '@lucide/svelte/icons/arrow-up'
  import { Badge } from '$lib/components/ui/badge/index.js'
  import { cn } from '$lib/utils.js'
  import { kindOf, severity } from './anomalies'
  import type { Metric } from './data'
  import { kindStyle } from './styles'

  let { metric }: { metric: Metric } = $props()
  const kind = $derived(kindOf(metric.today))
</script>

{#if kind === 'normal'}
  <span class="text-sm text-muted-foreground">In range</span>
{:else}
  {@const Icon = kind === 'spike' ? ArrowUp : ArrowDown}
  <div class="flex flex-col items-start gap-0.5">
    <Badge variant="outline" class={cn('gap-1', kindStyle[kind].badge)}>
      <Icon class="size-3" />
      {kindStyle[kind].label}
    </Badge>
    <span class="text-xs text-muted-foreground capitalize">
      {severity(metric.today)}
    </span>
  </div>
{/if}
