<script lang="ts">
  import { change, formatChange, kindOf, verdict } from './anomalies'
  import type { Metric } from './data'

  let { metric }: { metric: Metric } = $props()
</script>

<div class="flex flex-col items-end">
  <span class="tabular-nums">{formatChange(change(metric.today))}</span>
  {#if kindOf(metric.today) !== 'normal'}
    <span class="text-xs text-muted-foreground">
      {verdict(metric)}
    </span>
  {/if}
</div>
