<script lang="ts">
  import { cn } from '$lib/utils.js'
  import { formatValue, kindOf } from './anomalies'
  import type { Metric } from './data'
  import { kindStyle } from './styles'

  // The expected range as a bar, with a dot where today's value landed. The
  // scale stretches to fit both, so a far-off value is still on screen.
  let { metric }: { metric: Metric } = $props()

  const kind = $derived(kindOf(metric.today))
  const g = $derived.by(() => {
    const { actual, low, high } = metric.today
    const lo = Math.min(low, actual)
    const span = Math.max(high, actual) - lo || 1
    const at = (v: number) => 4 + ((v - lo) / span) * 92
    return { low: at(low), width: at(high) - at(low), actual: at(actual) }
  })
</script>

<div class="flex min-w-36 flex-col gap-1">
  <div aria-hidden="true" class="relative h-2">
    <span class="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border"
    ></span>
    <span
      class="absolute inset-y-0 rounded-full bg-muted-foreground/25"
      style:left="{g.low}%"
      style:width="{g.width}%"
    ></span>
    <span
      class={cn(
        'absolute top-1/2 size-2.5 -translate-1/2 rounded-full ring-2 ring-background',
        kind === 'normal' ? 'bg-foreground' : kindStyle[kind].dot,
      )}
      style:left="{g.actual}%"
    ></span>
  </div>
  <span class="text-xs text-muted-foreground tabular-nums">
    {formatValue(metric.today.low, metric)}–{formatValue(
      metric.today.high, metric,
    )}
  </span>
</div>
