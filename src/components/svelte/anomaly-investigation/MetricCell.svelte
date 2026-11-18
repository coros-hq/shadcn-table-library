<script lang="ts">
  import ArrowDown from '@lucide/svelte/icons/arrow-down'
  import ArrowUp from '@lucide/svelte/icons/arrow-up'
  import { cn } from '$lib/utils.js'
  import { kindOf, severity } from './anomalies'
  import type { Metric } from './data'
  import { kindStyle } from './styles'

  let { metric }: { metric: Metric } = $props()
  const kind = $derived(kindOf(metric.today))
</script>

<div class="flex flex-col sm:min-w-36">
  <span class="font-medium">{metric.name}</span>
  <span class="text-xs text-muted-foreground">{metric.segment}</span>
  <!-- On phones the Flag column is hidden; the flag shows here -->
  {#if kind !== 'normal'}
    {@const Icon = kind === 'spike' ? ArrowUp : ArrowDown}
    <span
      class={cn(
        'flex items-center gap-1 text-xs sm:hidden',
        kindStyle[kind].badge,
      )}
    >
      <Icon class="size-3" />
      {kindStyle[kind].label}, {severity(metric.today)}
    </span>
  {/if}
</div>
