import type { Metric } from './data'

// Orange for above the range, violet for below: the same in the chart
export const kindStyle = {
  spike: {
    label: 'Spike',
    badge: 'border-orange-500/50 text-orange-700 dark:text-orange-400',
    dot: 'bg-orange-500',
    fill: 'fill-orange-500',
  },
  drop: {
    label: 'Drop',
    badge: 'border-violet-500/50 text-violet-700 dark:text-violet-400',
    dot: 'bg-violet-500',
    fill: 'fill-violet-500',
  },
}

export interface AnomalyMeta {
  /** Metric ids someone has marked as reviewed */
  reviewed: Set<string>
  toggleReviewed: (id: string) => void
}

/** Where the chart puts each day, in a 560 × 140 drawing */
export function chartGeometry(metric: Metric) {
  const W = 560
  const H = 140
  const pad = { top: 10, right: 12, bottom: 10, left: 12 }
  const points = [...metric.history, metric.today]
  const values = points.flatMap((p) => [p.actual, p.low, p.high])
  const min = Math.min(...values)
  const max = Math.max(...values)
  const margin = (max - min) * 0.08 || 1
  const x = (i: number) =>
    pad.left + (i / (points.length - 1)) * (W - pad.left - pad.right)
  const y = (v: number) =>
    pad.top +
    (1 - (v - (min - margin)) / (max - min + margin * 2)) *
      (H - pad.top - pad.bottom)
  const band = [
    ...points.map((p, i) => `${x(i)},${y(p.high)}`),
    ...points.map((p, i) => `${x(i)},${y(p.low)}`).reverse(),
  ].join(' ')
  const line = points.map((p, i) => `${x(i)},${y(p.actual)}`).join(' ')
  /** The day under a pointer at `fraction` of the chart's width */
  const indexAt = (fraction: number) =>
    Math.max(
      0,
      Math.min(
        points.length - 1,
        Math.round(
          ((fraction * W - pad.left) / (W - pad.left - pad.right)) *
            (points.length - 1),
        ),
      ),
    )
  return { W, H, pad, points, x, y, band, line, indexAt }
}
