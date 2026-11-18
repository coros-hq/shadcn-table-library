<script lang="ts">
  import { context, formatDay, formatValue, kindOf } from './anomalies'
  import type { Metric } from './data'
  import HistoryChart from './HistoryChart.svelte'

  // The expanded row: the chart, and the facts that put today in context
  let { metric }: { metric: Metric } = $props()
  const facts = $derived(context(metric))
</script>

<div class="grid gap-6 sm:grid-cols-[minmax(0,1fr)_14rem]">
  <HistoryChart {metric} />
  <dl class="grid content-start gap-x-4 gap-y-2 text-sm">
    <div>
      <dt class="text-xs text-muted-foreground">Expected today</dt>
      <dd class="tabular-nums">
        {formatValue(metric.today.low, metric)}–{formatValue(
          metric.today.high, metric,
        )}
      </dd>
    </div>
    <div>
      <dt class="text-xs text-muted-foreground">7-day average</dt>
      <dd class="tabular-nums">{formatValue(facts.average7, metric)}</dd>
    </div>
    <div>
      <dt class="text-xs text-muted-foreground">Same day last week</dt>
      <dd class="tabular-nums">
        {formatValue(facts.lastWeek.actual, metric)}
      </dd>
    </div>
    <div>
      <dt class="text-xs text-muted-foreground">
        Earlier days outside the range
      </dt>
      <dd>
        {facts.outside.length
          ? facts.outside
              .map((p) => `${formatDay(p.date)} (${kindOf(p)})`)
              .join(', ')
          : 'None in the last 14 days'}
      </dd>
    </div>
  </dl>
</div>
