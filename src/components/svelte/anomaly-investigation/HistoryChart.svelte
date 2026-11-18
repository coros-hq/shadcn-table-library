<script lang="ts">
  import { cn } from '$lib/utils.js'
  import { formatDay, formatValue, kindOf } from './anomalies'
  import type { Metric } from './data'
  import { chartGeometry, kindStyle } from './styles'

  // Fourteen days and today: the expected range as a band, what happened as
  // a line, and every day outside the band as a dot. Hovering shows a day.
  let { metric }: { metric: Metric } = $props()

  const g = $derived(chartGeometry(metric))
  let hover = $state<number | null>(null)
  const shown = $derived(hover === null ? null : g.points[hover])

  function onpointermove(e: PointerEvent) {
    const box = (e.currentTarget as SVGElement).getBoundingClientRect()
    hover = g.indexAt((e.clientX - box.left) / box.width)
  }
</script>

<figure class="min-w-0 space-y-1.5">
  <div class="relative">
    <svg
      viewBox="0 0 {g.W} {g.H}"
      class="block h-auto w-full overflow-visible"
      aria-hidden="true"
      {onpointermove}
      onpointerleave={() => (hover = null)}
    >
      <polygon points={g.band} class="fill-muted-foreground/12" />
      {#if hover !== null}
        <line
          x1={g.x(hover)}
          x2={g.x(hover)}
          y1={g.pad.top}
          y2={g.H - g.pad.bottom}
          class="stroke-muted-foreground/50"
          stroke-width="1"
        />
      {/if}
      <polyline
        points={g.line}
        fill="none"
        class="stroke-foreground"
        stroke-width="2"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
      {#each g.points as p, i (p.date)}
        {@const kind = kindOf(p)}
        {#if kind !== 'normal' || i === g.points.length - 1 || hover === i}
          <circle
            cx={g.x(i)}
            cy={g.y(p.actual)}
            r={i === g.points.length - 1 ? 5 : 4}
            class={cn(
              'stroke-background',
              kind === 'normal' ? 'fill-foreground' : kindStyle[kind].fill,
            )}
            stroke-width="2"
          />
        {/if}
      {/each}
    </svg>
    {#if shown && hover !== null}
      <div
        class="pointer-events-none absolute top-0 z-10 w-max -translate-x-1/2 rounded-md border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-md"
        style:left="{Math.min(88, Math.max(12, (g.x(hover) / g.W) * 100))}%"
      >
        <p class="text-sm font-semibold tabular-nums">
          {formatValue(shown.actual, metric)}
        </p>
        <p class="text-muted-foreground">
          {formatDay(shown.date)}{hover === g.points.length - 1 ? ' (today)' : ''}
        </p>
        <p class="text-muted-foreground tabular-nums">
          Expected {formatValue(shown.low, metric)}–{formatValue(
            shown.high, metric,
          )}
        </p>
      </div>
    {/if}
  </div>
  <div aria-hidden="true" class="flex justify-between text-xs text-muted-foreground">
    <span>{formatDay(g.points[0].date)}</span>
    <span>Today</span>
  </div>
  <!-- The same numbers for screen readers, which skip the drawing -->
  <table class="sr-only">
    <caption>{metric.name}, last 15 days</caption>
    <thead>
      <tr><th>Day</th><th>Actual</th><th>Expected</th></tr>
    </thead>
    <tbody>
      {#each g.points as p (p.date)}
        <tr>
          <td>{formatDay(p.date)}</td>
          <td>{formatValue(p.actual, metric)}</td>
          <td>
            {formatValue(p.low, metric)} to {formatValue(p.high, metric)}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</figure>
