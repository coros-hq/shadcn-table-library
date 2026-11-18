import { useState } from 'react'

import { cn } from '#/lib/utils'
import { formatDay, formatValue, kindOf } from './anomalies'
import type { Metric } from './data'

const W = 560
const H = 140
const PAD = { top: 10, right: 12, bottom: 10, left: 12 }

/**
 * Fourteen days and today: the expected range as a band, what happened as a
 * line, and every day outside the band as a dot. Hovering shows a day.
 */
export function HistoryChart({ metric }: { metric: Metric }) {
  const points = [...metric.history, metric.today]
  const [hover, setHover] = useState<number | null>(null)

  const values = points.flatMap((p) => [p.actual, p.low, p.high])
  const min = Math.min(...values)
  const max = Math.max(...values)
  const pad = (max - min) * 0.08 || 1
  const x = (i: number) =>
    PAD.left + (i / (points.length - 1)) * (W - PAD.left - PAD.right)
  const y = (v: number) =>
    PAD.top +
    (1 - (v - (min - pad)) / (max - min + pad * 2)) * (H - PAD.top - PAD.bottom)

  const band = [
    ...points.map((p, i) => `${x(i)},${y(p.high)}`),
    ...points.map((p, i) => `${x(i)},${y(p.low)}`).reverse(),
  ].join(' ')
  const line = points.map((p, i) => `${x(i)},${y(p.actual)}`).join(' ')
  const shown = hover === null ? null : points[hover]

  return (
    <figure className="min-w-0 space-y-1.5">
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block h-auto w-full overflow-visible"
          aria-hidden
          onPointerMove={(e) => {
            const box = e.currentTarget.getBoundingClientRect()
            const at = ((e.clientX - box.left) / box.width) * W
            const i = Math.round(
              ((at - PAD.left) / (W - PAD.left - PAD.right)) *
                (points.length - 1),
            )
            setHover(Math.max(0, Math.min(points.length - 1, i)))
          }}
          onPointerLeave={() => setHover(null)}
        >
          <polygon points={band} className="fill-muted-foreground/12" />
          {hover !== null ? (
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={PAD.top}
              y2={H - PAD.bottom}
              className="stroke-muted-foreground/50"
              strokeWidth={1}
            />
          ) : null}
          <polyline
            points={line}
            fill="none"
            className="stroke-foreground"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {points.map((p, i) => {
            const kind = kindOf(p)
            const today = i === points.length - 1
            if (kind === 'normal' && !today && hover !== i) return null
            return (
              <circle
                key={p.date}
                cx={x(i)}
                cy={y(p.actual)}
                r={today ? 5 : 4}
                className={cn(
                  'stroke-background',
                  kind === 'spike'
                    ? 'fill-orange-500'
                    : kind === 'drop'
                      ? 'fill-violet-500'
                      : 'fill-foreground',
                )}
                strokeWidth={2}
              />
            )
          })}
        </svg>
        {shown && hover !== null ? (
          <div
            className="pointer-events-none absolute top-0 z-10 w-max -translate-x-1/2 rounded-md border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-md"
            style={{
              left: `${Math.min(88, Math.max(12, (x(hover) / W) * 100))}%`,
            }}
          >
            <p className="text-sm font-semibold tabular-nums">
              {formatValue(shown.actual, metric)}
            </p>
            <p className="text-muted-foreground">
              {formatDay(shown.date)}
              {hover === points.length - 1 ? ' (today)' : ''}
            </p>
            <p className="text-muted-foreground tabular-nums">
              Expected {formatValue(shown.low, metric)}–
              {formatValue(shown.high, metric)}
            </p>
          </div>
        ) : null}
      </div>
      <div
        aria-hidden
        className="flex justify-between text-xs text-muted-foreground"
      >
        <span>{formatDay(points[0].date)}</span>
        <span>Today</span>
      </div>
      {/* The same numbers for screen readers, which skip the drawing */}
      <table className="sr-only">
        <caption>{metric.name}, last 15 days</caption>
        <thead>
          <tr>
            <th>Day</th>
            <th>Actual</th>
            <th>Expected</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.date}>
              <td>{formatDay(p.date)}</td>
              <td>{formatValue(p.actual, metric)}</td>
              <td>
                {formatValue(p.low, metric)} to {formatValue(p.high, metric)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
